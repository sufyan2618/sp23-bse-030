const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// Signup routes
router.get("/signup", (req, res) => {
  res.render("signup", {
    layout: false,
    error: null,
  });
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error:
          "Email already registered. Please use a different email or login.",
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware
    });

    await newUser.save();

    // Redirect to login with success message
    res.render("login", {
        layout: false,
      success: "Registration successful! Please login.",
      error: null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.render("signup", {
      error: "Error during registration. Please try again.",
    });
  }
});

// Login routes
router.get("/login", (req, res) => {
  res.render("login", {
    layout: false,
    error: null,
    success: null,
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", {
        layout: false,
        error: "Invalid email or password",
        success: null,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.render("login", {
        layout: false,
        error: "Invalid email or password",
        success: null,
      });
    }

    // Set session data
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    // Check if there's a stored return URL
    const returnTo = req.session.returnTo || "/admin/dashboard_new";
    delete req.session.returnTo; // Clear the stored URL

    // Redirect to the stored URL or dashboard
    res.redirect(returnTo);
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      layout: false,
      error: "Error during login. Please try again.",
      success: null,
    });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/admin/dashboard_new");
    }
    res.redirect("/login");
  });
});

// Protected route middleware
// Protected route middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  // Store the requested URL to redirect back after login
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
}

// Protected dashboard route
module.exports = {
  router,
  isAuthenticated,
};
