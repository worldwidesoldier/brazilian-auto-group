const cars = require('./carsController').cars;

// Admin login
exports.login = (req, res) => {
    console.log('Login recebido:', req.body); // <-- Log para debug
    const { username, password } = req.body;

    // Simple authentication (replace with proper auth in production)
    if (username === 'admin' && password === 'admin123') {
        req.session.isAuthenticated = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

// Create new car
exports.createCar = (req, res) => {
    const newCar = {
        id: cars.length + 1,
        ...req.body
    };
    cars.push(newCar);
    res.status(201).json(newCar);
};

// Update car
exports.updateCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Car not found' });
    }

    cars[carIndex] = {
        ...cars[carIndex],
        ...req.body,
        id: carId // Ensure ID doesn't change
    };

    res.json(cars[carIndex]);
};

// Delete car
exports.deleteCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Car not found' });
    }

    cars.splice(carIndex, 1);
    res.status(204).send();
};