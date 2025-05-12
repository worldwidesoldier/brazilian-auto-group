const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: String,
    model: String,
    year: Number,
    price: Number,
    description: String,
    mileage: {
        type: Number,
        required: true,
        min: 0
    },
    fuelType: {
        type: String,
        enum: ['gasoline', 'ethanol', 'diesel', 'flex', 'hybrid', 'electric'],
        required: true
    },
    images: [String], // array of image URLs
    status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', carSchema);