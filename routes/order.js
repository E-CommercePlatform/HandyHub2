const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const product = require("../models/product");
const Cart = require("../models/cart");

const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);



// 🔥 1. CREATE STRIPE CHECKOUT SESSION (Buy Now)
router.post("/create-checkout/:productId", isLoggedIn, wrapAsync(async (req, res) => {

  const { productId } = req.params;

  const Product = await product.findById(productId);
  if (!Product) {
    throw new ExpressError("Product not found", 404);
  }

  // ✅ Create Stripe session with metadata (IMPORTANT)
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: Product.title,
          },
          unit_amount: Product.price * 100,
        },
        quantity: 1,
      },
    ],

    // 🔥 VERY IMPORTANT (secure data passing)
    metadata: {
      productId: productId,
      userId: req.user._id.toString(),
    },

    success_url: `http://localhost:4000/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:4000/products/${productId}`,
  });

  res.redirect(303, session.url);
}));



// 🔥 2. SUCCESS ROUTE (SECURE ORDER CREATION)
router.get("/success", isLoggedIn, wrapAsync(async (req, res) => {

  const { session_id } = req.query;

  if (!session_id) {
    throw new ExpressError("Invalid session", 400);
  }

  // ✅ Verify payment with Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    throw new ExpressError("Payment not completed", 400);
  }

  // 🔥 Get data from metadata (SECURE)
  const { productId, userId } = session.metadata;

  const Product = await product.findById(productId);
  if (!Product) {
    throw new ExpressError("Product not found", 404);
  }

  // 🔥 Prevent duplicate orders (IMPORTANT)
  const existingOrder = await Order.findOne({
    buyer: userId,
    totalPrice: session.amount_total / 100,
    status: "Paid"
  });

  if (existingOrder) {
    req.flash("success", "Order already placed!");
    return res.redirect("/order/myorders");
  }

  // ✅ Create order
  const newOrder = new Order({
    buyer: userId,
    products: [{ product: productId, quantity: 1 }],
    totalPrice: session.amount_total / 100,
    status: "Paid",
  });

  await newOrder.save();

  req.flash("success", "Payment successful & Order placed!");
  res.redirect("/order/myorders");
}));



// 🔹 OPTIONAL: Cash on Delivery (Old flow)
router.post("/buy/:productId", isLoggedIn, wrapAsync(async (req, res) => {

  const { productId } = req.params;
  const Product = await product.findById(productId);

  const quantity = parseInt(req.body.quantity || 1);
  const totalPrice = Product.price * quantity;

  const newOrder = new Order({
    buyer: req.user._id,
    products: [{ product: productId, quantity }],
    totalPrice,
    status: "Pending",
  });

  await newOrder.save();

  req.flash("success", "Order placed successfully!");
  res.redirect("/order/myorders");
}));



// 🔹 CART CHECKOUT (without Stripe)
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
    totalPrice,
    status: "Pending",
  });

  await newOrder.save();

  await Cart.findOneAndDelete({ user: userId });

  req.flash("success", "Order placed successfully!");
  res.redirect("/order/myorders");
}));



// 🔹 VIEW ORDERS
router.get("/myorders", isLoggedIn, wrapAsync(async (req, res) => {

  const orders = await Order.find({ buyer: req.user._id })
    .populate("products.product");

  res.render("order/order", { orders });
}));



module.exports = router;