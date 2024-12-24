// d:\Web\Project 3\Project\routes\admin\orders.router.js
const express = require("express");
const router = express.Router();
const Checkout = require("../../models/checkout.model"); // Keep using the Checkout model

// GET orders page with pagination
router.get("/admin/orders/:page?", async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;
        const pageSize = 5;
        let filter = {};

        // Add filter for status
        if (req.query.filterStatus) {
            filter.status = req.query.filterStatus;
        }

        const orders = await Checkout.find(filter)
            .limit(pageSize)
            .skip((page - 1) * pageSize);

        const totalRecords = await Checkout.countDocuments(filter);
        const totalPages = Math.ceil(totalRecords / pageSize);

        res.render("admin/orders", {
            layout: "admin/admin-layout",
            orders,
            currentPage: page,
            totalPages,
            currentFilter: req.query.filterStatus
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Internal Server Error");
    }
});


// POST route to complete an order
router.post("/admin/orders/complete/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        await Checkout.findByIdAndUpdate(orderId, { status: 'Completed' }); // Update the order status to completed
        res.redirect("/admin/orders"); // Redirect back to the orders page
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;