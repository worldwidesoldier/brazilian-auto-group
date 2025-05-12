const express = require('express');
const router = express.Router();
const carsController = require('../controllers/carsController');

// Listar todos os carros
router.get('/', carsController.getAllCars);

// Obter um carro específico
router.get('/:id', carsController.getCarById);

// Adicionar novo carro (com upload de imagem)
router.post('/', carsController.uploadImage, carsController.addCar);

// Atualizar carro (com upload de imagem opcional)
router.put('/:id', carsController.uploadImage, carsController.updateCar);

// Remover imagem específica de um carro
router.delete('/:id/images', carsController.deleteImage);

// Remover carro
router.delete('/:id', carsController.deleteCar);

module.exports = router; 