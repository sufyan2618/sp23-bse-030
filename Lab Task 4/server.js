const express = require("express");
let app = express();

const cookieParser = require("cookie-parser");
const session = require("express-session");



const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const expressLayouts = require("express-ejs-layouts");

// Middleware setup
app.use(cookieParser());
app.use(session({ secret: "My session secret", resave: false, saveUninitialized: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("uploads"));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.json());

// Connect to MongoDB
let connectionString = "mongodb://localhost:27017/Lals";
mongoose.connect(connectionString)
  .then(() => {
    console.log(`Connected To: ${connectionString}`);
  })
  .catch((err) => {
    console.log(err.message);
  });


// In server.js, add this before your routes
app.use((req, res, next) => {
  res.locals.customerId = req.session.customerId;
  res.locals.customerName = req.session.customerName;
  next();
});



const { router: authRouter, isAuthenticated } = require("./routes/auth.router");

// Apply authentication middleware to all admin routes
app.use('/admin', isAuthenticated);

// Then declare your admin routes
let productsRouter = require("./routes/admin/products.router");
app.use( productsRouter);

const dashboardRouter = require("./routes/admin/dashboard.router");
app.use( dashboardRouter);

const checkoutRouter = require("./routes/checkout.router");
app.use(checkoutRouter);

const categoryRouter = require('./routes/admin/category.router');
app.use(categoryRouter);

const ordersRouter = require("./routes/admin/orders.router");
app.use( ordersRouter);


const problemRouter = require('./routes/problem.router');
app.use(problemRouter);

//auth route is used at last
app.use(authRouter);



// In server.js
const customerRouter = require('./routes/customer.router');
app.use(customerRouter);


app.use((req, res, next) => {
    res.locals.customerName = req.session.customerName;
    res.locals.customerId = req.session.customerId;
    next();
});



const expressWs = require('express-ws');
const chatbot = require('./models/chatbot/chatbot');

expressWs(app);

// WebSocket route for chatbot
app.ws('/chatbot', async (ws, req) => {
  ws.on('message', async (msg) => {
    try {
      const response = await chatbot.processMessage(msg);
      ws.send(JSON.stringify({ message: response }));
    } catch (error) {
      ws.send(JSON.stringify({ error: 'Something went wrong' }));
    }
  });
});





// Search route
app.get("/search", async (req, res) => {
  try {
      const searchQuery = req.query.q;
      
      if (!searchQuery) {
          return res.redirect('/');
      }

      // Create a search regex pattern
      const searchPattern = new RegExp(searchQuery, 'i');

      // Search in multiple fields
      const products = await ProductModel.find({
          $or: [
              { title: searchPattern },
              { description: searchPattern }
          ]
      });

      res.render("search-results", { 
          products, 
          searchQuery,
          layout: "layout"
      });
  } catch (error) {
      console.error("Search error:", error);
      res.status(500).send("Error performing search");
  }
});






const Problem = require("./models/problem.model");

app.post("/contact-us", async (req, res) => {
    const { name, email, message } = req.body;
    const newProblem = new Problem({ name, email, message });
    await newProblem.save();
    res.redirect("/contact-us"); // Redirect back to the contact page or a thank you page
});


app.get("/contact-us", (req, res) => {
  res.render("contact-us"); // Render the contact form view
});


app.get("/about-us",(req,res) => {
  res.render("about-us");    //render about ut page
})


// Chatbot route
app.get("/chat", (req, res) => {
  res.render("chat", { layout: "layout" });
});


app.get("/add-to-cart/:id", async (req, res) => {
  let cart = req.cookies.cart || [];
  const productId = req.params.id;

  // Check if the product is already in the cart
  const productInCart = cart.find(item => item.id === productId);
  if (productInCart) {
    // If it is, increase the quantity
    productInCart.quantity += 1; // Increase quantity by 1
  } else {
    // If not, add it with quantity 1
    cart.push({ id: productId, quantity: 1 });
  }

  res.cookie("cart", cart);
  res.redirect("/");
});

// Increase quantity
app.post("/update-cart/:id", (req, res) => {
  try {
      let cart = req.cookies.cart || [];
      const productId = req.params.id;
      
      // Log the request body to debug
      console.log("Request body:", req.body);
      
      // Ensure quantity is properly extracted and parsed
      const quantity = parseInt(req.body.quantity);
      
   
      
      // Find and update the product in cart
      const productInCart = cart.find(item => item.id === productId);
      if (productInCart) {
          // Only update if quantity is a valid number
          if (!isNaN(quantity) && quantity > 0) {
              productInCart.quantity = quantity;
          } else {
              return res.status(400).json({ 
                  success: false, 
                  message: 'Invalid quantity provided' 
              });
          }
      } else {
          // Add new item if quantity is valid
          if (!isNaN(quantity) && quantity > 0) {
              cart.push({ id: productId, quantity: quantity });
          } else {
              return res.status(400).json({ 
                  success: false, 
                  message: 'Invalid quantity provided' 
              });
          }
      }

      
      // Update cookie and send response
      res.cookie("cart", cart);
      res.status(200).json({ success: true, cart: cart });
      
  } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ 
          success: false, 
          message: 'Error updating cart' 
      });
  }
});


app.get("/cart", async (req, res) => {
  try {
      let cart = req.cookies.cart || [];
      let productIds = cart.map(item => item.id);
      let products = await ProductModel.find({ _id: { $in: productIds } });

      // Calculate total price and prepare cart items with quantities
      let totalPrice = 0;
      let cartItems = products.map(product => {
          const cartItem = cart.find(item => item.id === product._id.toString());
          if (cartItem) {
              totalPrice += product.price * cartItem.quantity; // Multiply price by quantity
              return {
                  product,
                  quantity: cartItem.quantity, // Include quantity in the cart item
                  totalPrice: (product.price * cartItem.quantity).toFixed(2) // Calculate total price for this item
              };
          }
          return null; // If the product is not in the cart, return null
      }).filter(item => item !== null); // Filter out null items

      // Render the cart view with products, total price, and cart items
      return res.render("cart", { cartItems, totalPrice, cart });
      console.log(cartItems);
  } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).send('Internal Server Error');
  }
});

app.delete('/remove-from-cart/:id', async (req, res) => {
  try {
      const productId = req.params.id;
      console.log('Removing product:', productId);
      
      // Get current cart from cookies
      let cart = req.cookies.cart || [];
      console.log('Current cart before removal:', cart);
      
      // Filter out the item to be removed
      cart = cart.filter(item => item.id !== productId);
      console.log('Updated cart after removal:', cart);
      
      // Update the cookie with the new cart
      res.cookie('cart', cart);
      
      // Send response and redirect to refresh the page
      res.json({ 
          success: true, 
          message: 'Item removed from cart',
          cart: cart
      });
      
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Failed to remove item from cart' 
      });
  }
});





const ProductModel =  require("./models/product.model")
app.get("/", async (req, res) => {
  let products = await ProductModel.find();
  res.render("home", { products });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});