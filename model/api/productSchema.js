const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 20 },
  price: { type: Number, required: true },
  size: {
    type: String,
    enum: {
      values: ["SM", "MD", "XL", "XXL"], // if you add some extra size then you have to add the same size in validate.js file
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  description: { type: String, required: true, minLength: 3, maxLength: 100 },
  image: [{ type: String, required: true }],
  rating: {
    rate: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  feature: { type: Boolean, required: true },
  slug: { type: String, required: true, lowercase: true },
});

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = { ProductModel };
