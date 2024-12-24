// d:\Web\Project 3\Project\models\checkout.model.js
const mongoose = require("mongoose");

// Define the schema for checkout data
const checkoutSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // Add status field
    totalPrice: { type: Number, required: true } // Add totalPrice field
});

// Create the model
const Checkout = mongoose.model("Checkout", checkoutSchema);

// Export the model
module.exports = Checkout;