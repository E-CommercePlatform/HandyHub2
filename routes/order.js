const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const product = require("../models/product");
const Cart = require("../models/cart");
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

router.post("/buy/:productId", isLoggedIn, wrapAsync(async (req, res) => {
  const { productId } = req.params;
  const Product = await product.findById(productId);
  const quantity = parseInt(req.body.quantity || 1);
  const totalPrice = Product.price * quantity;

  const newOrder = new Order({
    buyer: req.user._id,
    products: [{ product: productId, quantity }],
    totalPrice,
  });

  await newOrder.save();
  req.flash("success", "Order placed successfully!");
  res.redirect("/order/myorders"); 
}));


router.post("/checkout", isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const userCart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!userCart || userCart.items.length === 0) {
    req.flash("error", "Your cart is empty!");
    return res.redirect("/cart");
  }

  const orderProducts = userCart.items.map(item => ({
    product: item.product._id,
    quantity: item.quantity
  }));

  const totalPrice = userCart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const newOrder = new Order({
    buyer: userId,
    products: orderProducts,
    totalPrice
  });

  await newOrder.save();

  // Clear the cart
  await Cart.findOneAndDelete({ user: userId });

  req.flash("success", "Order placed successfully!");
  res.redirect("/order/myorders");
}));


router.get("/myorders", isLoggedIn, wrapAsync(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate("products.product");
  res.render("order/order", { orders });
}));

module.exports = router;