const { Validator } = require("node-input-validator");
const { ProductModel } = require("../../model/api/productSchema");
const slugify = require("slugify");
const { validateEnum } = require("../../utility/validate");

async function createProduct(req, res) {
  const rules = {
    name: "required|string|minLength:3|maxLength:20",
    price: "required|numeric",
    size: "required|string",
    description: "required|string|minLength:3|maxLength:100",
    image: "required|array",
    rating: "required|object",
    "rating.rate": "required|numeric",
    "rating.count": "required|numeric",
    feature: "required|boolean",
  };

  try {
    const v = new Validator(req.body, rules);
    const matched = await v.check();
    // validate the request payload
    if (!matched) {
      return res.status(400).json({
        status: 400,
        error: v.errors,
        message: "Failed try again..!",
      });
    }
    /*============== Validate the Size ================*/

    if (!validateEnum(req.body.size)) {
      return res.status(400).json({
        status: 400,
        error: "Product size is not available right now..!",
        message: "Failed try again..!",
      });
    }

    // create Slug
    const slug = slugify(req.body.name, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
      trim: true,
    });
    // console.log(slug);

    const productModel = new ProductModel({ ...req.body, slug: slugify(req.body.name) });
    const products = await productModel.save();
    return res.status(201).json({
      status: 200,
      message: "success",
      data: products,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: error?.message,
      msg: "Faild try again..!",
    });
  }
}

async function getAllProduct(req, res) {
  try {
    const products = await ProductModel.find();
    return res.status(201).json({
      status: 200,
      message: "success",
      data: products,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: error?.message,
      msg: "Faild try again..!",
    });
  }
}
async function getSingleProduct(req, res) {
  // console.log(req.query.size)
  try {
    const product = await ProductModel.find({slug: req.params.slug, size: req.query.size});
    return res.status(201).json({
      status: 200,
      message: "success",
      data: product,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(500).json({
      error: error?.message,
      msg: "Faild try again..!",
    });
  }
}

module.exports = { createProduct, getAllProduct ,getSingleProduct};
