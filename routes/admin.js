const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rotas de inventário (NÃO precisa mais de login)
router.post('/cars', adminController.createCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

module.exports = router;