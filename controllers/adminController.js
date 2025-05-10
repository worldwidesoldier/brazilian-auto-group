const cars = require('./carsController').cars;

// Criar novo carro
exports.createCar = (req, res) => {
    const newCar = {
        id: cars.length + 1,
        ...req.body
    };
    cars.push(newCar);
    res.status(201).json(newCar);
};

// Atualizar carro
exports.updateCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Car not found' });
    }

    cars[carIndex] = {
        ...cars[carIndex],
        ...req.body,
        id: carId // Garante que o ID não muda
    };

    res.json(cars[carIndex]);
};

// Deletar carro
exports.deleteCar = (req, res) => {
    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(c => c.id === carId);

    if (carIndex === -1) {
        return res.status(404).json({ message: 'Car not found' });
    }

    cars.splice(carIndex, 1);
    res.status(204).send();
};