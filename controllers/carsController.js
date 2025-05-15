const multer = require('multer');
const Car = require('../models/Car');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

/**
 * Valida os dados de um carro.
 * @param {Object} data - Dados do carro
 * @returns {string[]} Lista de erros encontrados
 */
const validateCarData = (data) => {
    const errors = [];
    
    if (!data.brand?.trim()) errors.push('Brand is required');
    if (!data.model?.trim()) errors.push('Model is required');
    if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
        errors.push('Year must be between 1900 and next year');
    }
    if (!data.cashPrice || data.cashPrice <= 0) errors.push('Cash price must be greater than 0');
    if (!data.financedPrice || data.financedPrice <= 0) errors.push('Financed price must be greater than 0');
    if (!data.vinNumber?.trim()) errors.push('VIN number is required');
    if (!data.mileage || data.mileage < 0) errors.push('Mileage must be 0 or greater');
    
    const validFuelTypes = ['gasoline', 'ethanol', 'diesel', 'flex', 'hybrid', 'electric'];
    if (!data.fuelType || !validFuelTypes.includes(data.fuelType)) {
        errors.push(`Fuel type must be one of: ${validFuelTypes.join(', ')}`);
    }

    return errors;
};

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
                return res.status(400).json({ 
                    success: false,
                    message: 'File size too large. Max size is 5MB per file.' 
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ 
                    success: false,
                    message: 'Too many files. Maximum is 5 files.' 
                });
            }
            return res.status(400).json({ 
                success: false,
                message: err.message 
            });
        } else if (err) {
            return res.status(400).json({ 
                success: false,
                message: err.message 
            });
        }
        next();
    });
};

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort('-createdAt');
        return res.json({ 
            success: true,
            data: cars,
            message: 'Cars fetched successfully'
        });
    } catch (error) {
        console.error('[getAllCars] Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error fetching cars',
            details: error.message
        });
    }
};

exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ 
                success: false,
                message: 'Car not found',
                data: null
            });
        }
        return res.json({ 
            success: true,
            data: car,
            message: 'Car fetched successfully'
        });
    } catch (error) {
        console.error('[getCarById] Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error fetching car',
            details: error.message
        });
    }
};

exports.addCar = async (req, res) => {
    try {
        const { brand, model, year, cashPrice, financedPrice, vinNumber, description, mileage, fuelType } = req.body;

        // Validate required fields
        const validationErrors = validateCarData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                details: validationErrors,
                data: null
            });
        }

        // Check if VIN already exists
        const existingCar = await Car.findOne({ vinNumber: vinNumber.trim() });
        if (existingCar) {
            return res.status(400).json({
                success: false,
                message: 'A car with this VIN number already exists',
                data: null
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
                console.error('[addCar] Error uploading images:', uploadError);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error uploading images',
                    details: uploadError.message,
                    data: null
                });
            }
        }

        const car = new Car({
            brand: brand.trim(),
            model: model.trim(),
            year: parseInt(year),
            cashPrice: parseFloat(cashPrice),
            financedPrice: parseFloat(financedPrice),
            vinNumber: vinNumber.trim(),
            description: description?.trim() || '',
            mileage: parseInt(mileage),
            fuelType,
            images: imageUrls,
            status: 'available'
        });

        const savedCar = await car.save();
        return res.status(201).json({ 
            success: true,
            data: savedCar,
            message: 'Car added successfully'
        });
    } catch (error) {
        console.error('[addCar] Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error adding car',
            details: error.message,
            data: null
        });
    }
};

exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ 
                success: false,
                message: 'Car not found',
                data: null
            });
        }

        const { brand, model, year, cashPrice, financedPrice, vinNumber, description, status, mileage, fuelType } = req.body;
        
        // Validate data if provided
        const validationErrors = validateCarData({
            ...car.toObject(),
            ...req.body
        });
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                details: validationErrors,
                data: null
            });
        }

        // Check VIN uniqueness if changed
        if (vinNumber && vinNumber !== car.vinNumber) {
            const existingCar = await Car.findOne({ 
                vinNumber: vinNumber.trim(),
                _id: { $ne: car._id }
            });
            if (existingCar) {
                return res.status(400).json({
                    success: false,
                    message: 'A car with this VIN number already exists',
                    data: null
                });
            }
        }
        
        // Recebe as imagens antigas que sobraram (do frontend)
        let oldImages = [];
        if (req.body.oldImages) {
            try {
                oldImages = JSON.parse(req.body.oldImages);
            } catch (e) {
                oldImages = Array.isArray(req.body.oldImages) ? req.body.oldImages : [req.body.oldImages];
            }
        } else {
            oldImages = car.images || [];
        }

        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                for (const file of req.files) {
                    const url = await uploadToS3(file);
                    newImageUrls.push(url);
                }
            } catch (uploadError) {
                console.error('[updateCar] Error uploading new images:', uploadError);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error uploading new images',
                    details: uploadError.message,
                    data: null
                });
            }
        }

        // Juntar antigas + novas, sem passar de 5
        const allImages = [...oldImages, ...newImageUrls].slice(0, 5);

        // Apagar do S3 as imagens removidas
        const removedImages = (car.images || []).filter(img => !oldImages.includes(img));
        if (removedImages.length > 0) {
            for (const imageUrl of removedImages) {
                try {
                    await deleteFromS3(imageUrl);
                } catch (deleteError) {
                    console.error('[updateCar] Error deleting image from S3:', deleteError);
                    // Não retornamos erro aqui para não impedir a atualização do carro
                }
            }
        }

        // Update car fields
        const updates = {
            brand: brand ? brand.trim() : car.brand,
            model: model ? model.trim() : car.model,
            year: year ? parseInt(year) : car.year,
            cashPrice: cashPrice ? parseFloat(cashPrice) : car.cashPrice,
            financedPrice: financedPrice ? parseFloat(financedPrice) : car.financedPrice,
            vinNumber: vinNumber ? vinNumber.trim() : car.vinNumber,
            description: description !== undefined ? description.trim() : car.description,
            mileage: mileage ? parseInt(mileage) : car.mileage,
            fuelType: fuelType || car.fuelType,
            images: allImages,
            status: status || car.status,
            updatedAt: new Date()
        };

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedCar) {
            return res.status(404).json({ 
                success: false,
                message: 'Car not found after update attempt',
                data: null
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: updatedCar,
            message: 'Car updated successfully'
        });
    } catch (error) {
        console.error('[updateCar] Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error',
                details: Object.values(error.errors).map(err => err.message),
                data: null
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid data format',
                details: error.message,
                data: null
            });
        }
        return res.status(500).json({ 
            success: false,
            message: 'Error updating car',
            details: error.message,
            data: null
        });
    }
};

exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ 
                success: false,
                message: 'Car not found',
                data: null
            });
        }

        // Remove images from S3
        if (car.images && car.images.length > 0) {
            try {
                for (const imageUrl of car.images) {
                    await deleteFromS3(imageUrl);
                }
            } catch (deleteError) {
                console.error('[deleteCar] Error deleting images:', deleteError);
                return res.status(500).json({ 
                    success: false,
                    message: 'Error deleting images',
                    details: deleteError.message,
                    data: null
                });
            }
        }

        await Car.findByIdAndDelete(req.params.id);
        return res.status(200).json({ 
            success: true,
            message: 'Car deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('[deleteCar] Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error deleting car',
            details: error.message,
            data: null
        });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ 
                success: false,
                message: 'Car not found',
                data: null
            });
        }

        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ 
                success: false,
                message: 'Image URL is required',
                data: null
            });
        }

        // Remove image from S3
        try {
            await deleteFromS3(imageUrl);
        } catch (deleteError) {
            console.error('[deleteImage] Error deleting image from S3:', deleteError);
            return res.status(500).json({ 
                success: false,
                message: 'Error deleting image from storage',
                details: deleteError.message,
                data: null
            });
        }

        // Remove image URL from car's images array
        car.images = car.images.filter(img => img !== imageUrl);
        await car.save();

        return res.status(200).json({ 
            success: true,
            message: 'Image deleted successfully',
            data: null
        });
    } catch (error) {
        console.error('[deleteImage] Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error deleting image',
            details: error.message,
            data: null
        });
    }
};