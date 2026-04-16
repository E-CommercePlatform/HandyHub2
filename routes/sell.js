const express = require("express");
const router = express.Router();
const product = require("../models/product");
const wrapAsync = require("../utils/wrapAsync");
const multer = require("multer");
const { isLoggedIn } = require("../middleware");
const { storage } = require("../cloudConfig")
const upload = multer({storage});

router.get("" , isLoggedIn, wrapAsync(async(req, res) => {
    res.render("product/sell");
}));

router.post(
  "/products/add",
  isLoggedIn, 
  upload.single("ProductImage"),
  wrapAsync(async (req, res) => {
    const { title, actualPrice, category, mfg, description, oldPrice } = req.body;

    // const oldPrice = parseFloat(actualPrice);
    // const price = parseFloat((oldPrice * 1.2).toFixed(2));

    const newProduct = new product({
      title,
      image: req.file?.path || "", 
      oldPrice,
      price: actualPrice,
      sellerId: req.user._id, 
      category,
      mfg,
      description,
    });

    await newProduct.save();
    req.flash("success", "Product added successfully!");
    res.redirect("/products");
  })
);

router.get("/products/:id/edit", isLoggedIn, wrapAsync(async(req, res) => {
    const { id } = req.params;
    
    foundProduct = await product.findById(id);
    console.log(foundProduct);

    if(!foundProduct) {
      req.flash("error", "Product not found");
        return res.redirect("/products");
    }
    
    res.render("dashboard/productEdit", {foundProduct});
}));

router.put("/products/:id/update", upload.single("ProductImage"),isLoggedIn, wrapAsync(async(req, res) => {
    const { id } = req.params;
    const updatedData = req.body
    if (req.file) {
      updatedData.image = req.file.path;
    }
    const Product = await product.findByIdAndUpdate(id, updatedData);

    await Product.save();

    req.flash("success", "Product updated successfully!");
    res.redirect("/products");
}))

router.delete("/products/:id", isLoggedIn, wrapAsync(async(req, res) => {
    const { id } = req.params;
   await product.findByIdAndDelete(id);
  req.flash("success", "Product deleted successfully");
  res.redirect("/user/dashboard");
}));

module.exports = router;