// We make a seperate file for each collection in our mongodb
const mongoose = require("mongoose");
// make a schema
let productSchema = new mongoose.Schema({
  title: String,
  description: String,
  picture: String,
  price: Number,
  isFeatured: { type: Boolean, default: false },
});
//make a model
let Product = mongoose.model("Product", productSchema);
//export that model
module.exports = Product;
