const multer = require('multer');
const Car = require('../models/Car');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

// Multer config for multiple images
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5 // max 5 files
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
    }
}).array('images', 5);

exports.uploadImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size too large. Max size is 5MB per file.' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

// ...restante do código do controller...

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort('-createdAt');
        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Error fetching cars' });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        console.error('Error fetching car:', error);
        res.status(500).json({ message: 'Error fetching car' });
    }
};

exports.addCar = async (req, res) => {
    try {
        const { brand, model, year, price, description } = req.body;

        // Validate required fields
        if (!brand || !model || !year || !price) {
            return res.status(400).json({ 
                message: 'Missing required fields: brand, model, year, and price are required' 
            });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    const url = await uploadToS3(file);
                    imageUrls.push(url);
                }
            } catch (uploadError) {
                console.error('Error uploading images:', uploadError);
                return res.status(500).json({ message: 'Error uploading images' });
            }
        }

        const car = new Car({
            brand,
            model,
            year: parseInt(year),
            price: parseFloat(price),
            description: description || '',
            images: imageUrls,
            status: 'available'
        });

        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(400).json({ message: 'Error adding car' });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const { brand, model, year, price, description, status } = req.body;
        let imageUrls = car.images || [];

        if (req.files && req.files.length > 0) {
            try {
                // Remove old images from S3
                if (car.images && car.images.length > 0) {
                    for (const imageUrl of car.images) {
                        await deleteFromS3(imageUrl);
                    }
                }

                // Upload new images
                imageUrls = [];
                for (const file of req.files) {
                    const url = await uploadToS3(file);
                    imageUrls.push(url);
                }
            } catch (uploadError) {
                console.error('Error handling images:', uploadError);
                return res.status(500).json({ message: 'Error handling images' });
            }
        }

        // Update car fields
        const updates = {
            brand: brand || car.brand,
            model: model || car.model,
            year: year ? parseInt(year) : car.year,
            price: price ? parseFloat(price) : car.price,
            description: description || car.description,
            images: imageUrls,
            status: status || car.status,
            updatedAt: new Date()
        };

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json(updatedCar);
    } catch (error) {
        console.error('Error updating car:', error);
        res.status(400).json({ message: 'Error updating car' });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Remove images from S3
        if (car.images && car.images.length > 0) {
            try {
                for (const imageUrl of car.images) {
                    await deleteFromS3(imageUrl);
                }
            } catch (deleteError) {
                console.error('Error deleting images:', deleteError);
                return res.status(500).json({ message: 'Error deleting images' });
            }
        }

        await Car.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ message: 'Error deleting car' });
    }
};