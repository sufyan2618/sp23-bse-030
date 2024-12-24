const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Checkout = require("../models/checkout.model"); // Import the Checkout model


//node mailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
        user: 'saudshakeel3109@gmail.com', // Your email address
        pass: 'navv lkuz idhz kfzs' // Your email password or app password
    }
});

// GET checkout form
const ProductModel = require("../models/product.model"); // Import the Product model


// Map products with their quantities from cart
// GET checkout form
router.get("/checkout", async (req, res) => {
    let cart = req.cookies.cart || [];
    let productIds = cart.map(item => item.id);
    let products = await ProductModel.find({ _id: { $in: productIds } });
  
    // Map products with their quantities from cart
    let productsWithQuantity = products.map(product => {
        const cartItem = cart.find(item => item.id === product._id.toString());
        return {
            ...product.toObject(),
            quantity: cartItem ? cartItem.quantity : 1
        };
    });
  
    // Calculate total price including quantities
    let totalPrice = productsWithQuantity.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
    }, 0);
  
    res.render("checkout", { 
        layout: "layout", 
        products: productsWithQuantity, 
        totalPrice 
    });
});
// POST checkout form


router.post("/checkout", async (req, res) => {
    try {
        let cart = req.cookies.cart || [];
        let productIds = cart.map(item => item.id);
        let products = await ProductModel.find({ _id: { $in: productIds } });

        // Calculate total price
        let totalPrice = 0;
        products.forEach(product => {
            const cartItem = cart.find(item => item.id === product._id.toString());
            if (cartItem) {
                totalPrice += product.price * cartItem.quantity; // Multiply price by quantity
            }
        });

        // Create a new checkout entry
        const newCheckout = new Checkout({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            country: req.body.country,
            totalPrice: totalPrice + 250 // Store the total price from the calculation
        });

        // Save the checkout data to the database
        const savedOrder = await newCheckout.save();

        // Send confirmation email (remains unchanged)
        const mailOptions = {
            from: 'saudshakeel3109@gmail.com',
            to: req.body.email,
            subject: 'Order Confirmation',
            text: `Thank you for your order, ${req.body.firstName} ${req.body.lastName}!\n\n` +
                  `Your Order Number: #${savedOrder._id}\n\n` +
                  `Your order details:\n` +
                  '-------------------\n' +
                  `Name: ${req.body.firstName} ${req.body.lastName}\n` +
                  `Email: ${req.body.email}\n` +
                  `Address: ${req.body.address}, ${req.body.city}, ${req.body.postalCode}, ${req.body.country}\n\n` +
                  `Total Price: $${totalPrice}\n\n` + // Include total price in the email
                  `We will process your order shortly.\n\n` +
                  `Best regards,\nLals`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error sending email: ', error);
            }
            console.log('Email sent: ' + info.response);
        });

        // Clear the cart after successful checkout
        res.clearCookie("cart");
        res.redirect("/"); // Change this to your desired redirect path
    } catch (error) {
        console.error("Error saving checkout data:", error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;