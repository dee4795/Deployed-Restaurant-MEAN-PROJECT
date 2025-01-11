const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true }
}, {
    timestamps: true,
    updatedAt: true
});

module.exports = mongoose.model('User', userSchema);