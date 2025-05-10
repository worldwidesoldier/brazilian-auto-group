const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Apenas imagens são permitidas!'));
    }
}).single('image');

// Array em memória para armazenar os carros (simulando banco de dados)
let cars = [
    {
        id: 1,
        name: "2023 Toyota Camry",
        price: 28990,
        year: 2023,
        image: "https://images.unsplash.com/photo-1617469767053-3c4f2a7c37e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Excellent condition, low mileage, one owner",
        features: ["Automatic", "4 Cylinder", "Gas", "FWD"]
    },
    {
        id: 2,
        name: "2022 Honda Accord",
        price: 26990,
        year: 2022,
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Well maintained, clean history, great fuel economy",
        features: ["Automatic", "4 Cylinder", "Hybrid", "FWD"]
    },
    {
        id: 3,
        name: "2023 Ford Mustang",
        price: 35990,
        year: 2023,
        image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Powerful V8 engine, premium interior, sport package",
        features: ["Automatic", "V8", "Gas", "RWD"]
    }
];

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
exports.getAllCars = (req, res) => {
    res.json(cars);
};

// Get featured cars (first 3 cars)
exports.getFeaturedCars = (req, res) => {
    res.json(cars.slice(0, 3));
};

// Obter um carro específico
exports.getCarById = (req, res) => {
    const car = cars.find(c => c.id === parseInt(req.params.id));
    if (!car) {
        return res.status(404).json({ message: 'Carro não encontrado' });
    }
    res.json(car);
};

// Adicionar novo carro
exports.addCar = (req, res) => {
    const { brand, model, year, price, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newCar = {
        id: cars.length + 1,
        brand,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        description,
        image: imagePath,
        createdAt: new Date(),
        status: 'available' // available, sold
    };

    cars.push(newCar);
    res.status(201).json(newCar);
};

// Atualizar carro
exports.updateCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Carro não encontrado' });
    }

    const { brand, model, year, price, description, status } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : cars[carIndex].image;

    // Se houver uma nova imagem, remover a antiga
    if (req.file && cars[carIndex].image) {
        const oldImagePath = path.join(__dirname, '..', 'public', cars[carIndex].image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    cars[carIndex] = {
        ...cars[carIndex],
        brand: brand || cars[carIndex].brand,
        model: model || cars[carIndex].model,
        year: year ? parseInt(year) : cars[carIndex].year,
        price: price ? parseFloat(price) : cars[carIndex].price,
        description: description || cars[carIndex].description,
        image: imagePath,
        status: status || cars[carIndex].status,
        updatedAt: new Date()
    };

    res.json(cars[carIndex]);
};

// Remover carro
exports.deleteCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Carro não encontrado' });
    }

    // Remover a imagem do carro
    if (cars[carIndex].image) {
        const imagePath = path.join(__dirname, '..', 'public', cars[carIndex].image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    cars.splice(carIndex, 1);
    res.status(204).send();
}; 