const Product = require("../models/Product");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};