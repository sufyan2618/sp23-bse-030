// routes/customer.router.js
const express = require('express');
const router = express.Router();
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Checkout = require('../models/checkout.model'); 

// Middleware to check if customer is logged in
const isCustomerLoggedIn = (req, res, next) => {
    if (req.session.customerId) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/customer/login');
    }
};

// Customer signup
router.get('/customer/signup', (req, res) => {
    res.render('customer/signup', {
        layout: 'layout',
        error: null
    });
});

router.post('/customer/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.render('customer/signup', {
                layout: 'layout',
                error: 'Email already registered'
            });
        }

        // Create new customer
        const customer = new Customer({ name, email, password });
        await customer.save();

        res.redirect('/customer/login?success=true');
    } catch (error) {
        res.render('customer/signup', {
            layout: 'layout',
            error: 'Error during registration'
        });
    }
});

// Customer login
router.get('/customer/login', (req, res) => {
    res.render('customer/login', {
        layout: 'layout',
        error: null,
        success: req.query.success ? 'Registration successful! Please login.' : null
    });
});

router.post('/customer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });

        if (!customer || !(await customer.comparePassword(password))) {
            return res.render('customer/login', {
                layout: 'layout',
                error: 'Invalid email or password',
                success: null
            });
        }

        // Set session
        req.session.customerId = customer._id;
        req.session.customerName = customer.name;

        // Redirect to stored URL or home
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(returnTo);

    } catch (error) {
        res.render('customer/login', {
            layout: 'layout',
            error: 'Login error',
            success: null
        });
    }
});

// Customer logout
router.get('/customer/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Wishlist routes
router.post('/wishlist/add/:productId', isCustomerLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.session.customerId);
        const productId = req.params.productId;

        if (!customer.wishlist.includes(productId)) {
            customer.wishlist.push(productId);
            await customer.save();
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.delete('/wishlist/remove/:productId', isCustomerLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.session.customerId);
        customer.wishlist = customer.wishlist.filter(id => 
            id.toString() !== req.params.productId
        );
        await customer.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get('/wishlist', isCustomerLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.session.customerId)
            .populate('wishlist');
        
        res.render('customer/wishlist', {
            layout: 'layout',
            wishlist: customer.wishlist
        });
    } catch (error) {
        res.redirect('/');
    }
});





// routes/customer.router.js
// Add this route after your existing routes

// Profile route
router.get('/customer/profile', isCustomerLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.session.customerId);
        const orders = await Checkout.find({ email: customer.email })
            .sort({ createdAt: -1 });

        res.render('customer/profile', {
            layout: 'layout',
            customer,
            orders
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.redirect('/');
    }
});

// Add route to update profile
router.post('/customer/profile/update', isCustomerLoggedIn, async (req, res) => {
    try {
        const { name, email } = req.body;
        await Customer.findByIdAndUpdate(req.session.customerId, {
            name,
            email
        });
        
        // Update session name
        req.session.customerName = name;
        
        res.redirect('/customer/profile?success=true');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.redirect('/customer/profile?error=true');
    }
});









// In your customer.router.js, populate wishlist
router.get('/customer/profile', isCustomerLoggedIn, async (req, res) => {
    try {
        const customer = await Customer.findById(req.session.customerId)
            .populate('wishlist');
        const orders = await Checkout.find({ email: customer.email })
            .sort({ createdAt: -1 });

        res.render('customer/profile', {
            layout: 'layout',
            customer,
            orders
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.redirect('/');
    }
});


module.exports = router;
