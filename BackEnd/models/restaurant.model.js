const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    services: { type: String, required: true },
    mobile: { type: Number, required: true }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);