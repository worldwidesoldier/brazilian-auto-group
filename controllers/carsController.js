const multer = require('multer');
const Car = require('../models/Car');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

// Configuração do multer para memória (necessário para S3)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(require('path').extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    }
}).single('image');

// Middleware para upload de imagem
exports.uploadImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

// Listar todos os carros
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().sort('-createdAt');
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Carros em destaque (primeiros 3 do banco)
exports.getFeaturedCars = async (req, res) => {
    try {
        const cars = await Car.find().sort('-createdAt').limit(3);
        res.json(cars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obter um carro específico
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Carro não encontrado' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Adicionar novo carro
exports.addCar = async (req, res) => {
    try {
        const { brand, model, year, price, description } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = await uploadToS3(req.file);
        }

        const car = new Car({
            brand,
            model,
            year: parseInt(year),
            price: parseFloat(price),
            description,
            image: imageUrl
        });

        const savedCar = await car.save();
        res.status(201).json(savedCar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar carro
exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Carro não encontrado' });
        }

        const { brand, model, year, price, description, status } = req.body;
        let imageUrl = car.image;

        if (req.file) {
            // Deletar imagem antiga do S3
            if (car.image) {
                await deleteFromS3(car.image);
            }
            // Upload nova imagem
            imageUrl = await uploadToS3(req.file);
        }

        car.brand = brand || car.brand;
        car.model = model || car.model;
        car.year = year ? parseInt(year) : car.year;
        car.price = price ? parseFloat(price) : car.price;
        car.description = description || car.description;
        car.image = imageUrl;
        car.status = status || car.status;
        car.updatedAt = new Date();

        const updatedCar = await car.save();
        res.json(updatedCar);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remover carro
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Carro não encontrado' });
        }

        // Deletar imagem do S3
        if (car.image) {
            await deleteFromS3(car.image);
        }

        await car.remove();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};