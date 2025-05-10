const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Login (agora não precisa mais de autenticação)
router.post('/login', adminController.login);

// Rotas de inventário (se existirem)
router.post('/cars', adminController.createCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);

module.exports = router;