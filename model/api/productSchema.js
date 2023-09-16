const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 3 },
  price: { type: Number, required: true },
  size: {
    type: String,
    enum: {
      values: ["SM", "MD", "XL", "XXL"],
      message: "{VALUE} is not supported",
    },
    required: true,
  },
  description: { type: String, required: true, minLength: 30, maxLength: 30 },
  image: [{ type: String, required: true }],
  rating: {
    rate: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  feature: { type: Boolean, required: true },
});

const ProductModel= mongoose.model();