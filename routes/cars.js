const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');

// Get all cars
router.get('/', carsController.getAllCars);

// Get featured cars
router.get('/featured', carsController.getFeaturedCars);

// Get car by ID
router.get('/:id', carsController.getCarById);

module.exports = router; 