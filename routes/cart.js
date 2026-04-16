const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const product = require("../models/product");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require("../middleware");

// Add item to cart
router.post("/:productId", isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const Product = await product.findById(productId);
  if (!Product) throw new ExpressError("Product not found", 404);

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity: 1 }]
    });
  } else {
    const existingItem = cart.items.find(item => item.product.equals(productId));
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }
  }

  await cart.save();
  req.flash("success", "Added to cart!");
  res.redirect(`/products/${productId}`);
}));

// View cart
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  const cartItems = cart ? cart.items : [];
  res.render("wishlistAndCart/cart", { cartItems });
}));

// Remove item from cart
router.delete("/:productId", isLoggedIn, wrapAsync(async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();
    req.flash("success", "Item removed from cart");
  }

  res.redirect("/cart");
}));

module.exports = router;
