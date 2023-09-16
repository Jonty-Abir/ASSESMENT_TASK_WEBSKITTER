const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String, require: true },
  suite: { type: String, require: true },
  city: { type: String, require: true },
  zipCode: { type: String, require: true },
  geo: {
    lat: { type: Number, require: true },
    lng: { type: Number, require: true },
  },
});

const employSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    userName: { type: String, require: true },
    email: { type: String, require: true },
    address: addressSchema,
    phone: { type: String, require: true },
    website: { type: String, require: true },
    company: {
      name: { type: String, require: true },
      catchPhrase: { type: String, require: true },
      bs: { type: String, require: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);
const EmployModel = mongoose.model("Employ", employSchema);

module.exports = { EmployModel };
