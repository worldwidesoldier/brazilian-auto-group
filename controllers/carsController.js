// In-memory database (replace with real database in production)
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

// Get all cars
exports.getAllCars = (req, res) => {
    res.json(cars);
};

// Get featured cars (first 3 cars)
exports.getFeaturedCars = (req, res) => {
    res.json(cars.slice(0, 3));
};

// Get car by ID
exports.getCarById = (req, res) => {
    const car = cars.find(c => c.id === parseInt(req.params.id));
    if (!car) {
        return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
}; 