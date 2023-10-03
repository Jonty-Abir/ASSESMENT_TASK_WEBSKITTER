const { Validator } = require("node-input-validator");
const { EmployModel } = require("../../model/api/employSchema");

async function createEmploy(req, res) {
  const rules = {
    name: "required|string|minLength:3",
    userName: "required|string|minLength:3",
    email: "required|email",
    address: "required|object",
    "address.street": "required|string|minLength:3",
    "address.suite": "required|string|minLength:3",
    "address.city": "required|string|minLength:3",
    "address.zipCode": "required|string",
    "address.geo": "required|object",
    "address.geo.lat": "required|numeric",
    "address.geo.lng": "required|numeric",
    phone: "string|required",
    website: "string|required",
    company: "required|object",
    "company.name": "required|string|minLength:3",
    "company.catchPhrase": "required|string|minLength:3",
    "company.bs": "required|string|minLength:3",
  };
  try {
    const v = new Validator(req.body, rules);
    const matched = await v.check();
    // validate the request payload
    if (!matched) {
      return res.status(400).json({
        status: 400,
        error: v.errors,
        message: "Faild try again..!",
      });
    }
    const newModel = new EmployModel({ ...req.body });
    const newlyCreatedUser = await newModel.save();
    return res.status(201).json({
      status: 200,
      message: "success",
      data: newlyCreatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error?.message,
      msg: "Faild try again..!",
    });
  }
}

async function getAllEmploy(req, res) {
  try {
    const employs = await EmployModel.find();
    return res.status(201).json({
      status: 200,
      message: "success",
      data: employs,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: error?.message,
      msg: "Faild try again..!",
    });
  }
}

module.exports = { createEmploy, getAllEmploy };
