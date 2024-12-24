const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    answer: { type: String },
    isAnswered: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);