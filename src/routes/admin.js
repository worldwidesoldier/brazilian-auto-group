const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Admin authentication
router.post('/login', adminController.login);

// Protected routes (require authentication)
router.use(authMiddleware);

// Car management
router.post('/cars', adminController.createCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

module.exports = router; 