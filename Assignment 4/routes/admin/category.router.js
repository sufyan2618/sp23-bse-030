// routes/admin/category.router.js
const express = require('express');
const router = express.Router();
const Category = require('../../models/category.model');

// Get all categories
router.get("/admin/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("admin/categories", { 
            layout: "admin/admin-layout",
            categories 
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send('Server Error');
    }
});

// Show create category form
router.get("/admin/categories/create", (req, res) => {
    res.render("admin/category-form", {
        layout: "admin/admin-layout"
    });
});

// Create category
router.post("/admin/categories/create", async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({
            name,
            description
        });
        await category.save();
        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).send('Server Error');
    }
});

// Show edit category form
router.get("/admin/categories/edit/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.render("admin/edit-category", {
            layout: "admin/admin-layout",
            category
        });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).send('Server Error');
    }
});

// Update category
router.post("/admin/categories/edit/:id", async (req, res) => {
    try {
        const { name, description } = req.body;
        await Category.findByIdAndUpdate(req.params.id, {
            name,
            description
        });
        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send('Server Error');
    }
});

// Delete category
router.post("/admin/categories/delete/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
