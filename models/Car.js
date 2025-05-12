const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    brand: String,
    model: String,
    year: Number,
    price: Number,
    description: String,
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