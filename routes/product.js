const express = require("express");
const router = express.Router();
const product = require("../models/product");
const wrapAsync = require("../utils/wrapAsync");


// show all products
router.get("", wrapAsync(async (req, res) => {
  const allProducts = await product.find({});
  res.render("product/product", { allProducts });
}));

// find on the basis of category
router.get("/filter/:category", wrapAsync(async (req, res) => {
    let { category } = req.params;
    let filterProduct = await product.find({ category: category });
    res.render("product/filter.ejs", { filterProduct });
  }));
  
  // show single product
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let Product = await product.findById(id).populate({path:"reviews", populate:{path: "author"}})
    res.render("product/show.ejs", { Product });
}));

module.exports = router;
