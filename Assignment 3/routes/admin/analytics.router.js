// routes/admin/analytics.router.js
const express = require('express');
const router = express.Router();
const Product = require('../../models/product.model');
const Order = require('../../models/checkout.model');
const Problem = require('../../models/problem.model');

router.get("/admin/analytics", async (req, res) => {
    try {
        // Get overall statistics
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCustomerQueries = await Problem.countDocuments();
        
        // Calculate total revenue from completed orders
        const revenueData = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { 
                _id: null, 
                totalRevenue: { $sum: "$totalPrice" }
            }}
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: "$products" },
            { $group: {
                _id: "$products.product",
                totalSold: { $sum: 1 }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }}
        ]);

        // Get monthly revenue data
        const monthlyRevenue = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: {
                _id: { 
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                revenue: { $sum: "$totalPrice" }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.render("admin/analytics", {
            layout: "admin/admin-layout",
            totalOrders,
            totalProducts,
            totalCustomerQueries,
            totalRevenue,
            topProducts,
            monthlyRevenue
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).send('Error loading analytics');
    }
});

module.exports = router;
