const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Wishlist = require("../models/wishlist");
const Product = require("../models/product");
const { isLoggedIn } = require("../middleware");

router.post("/:productId", isLoggedIn, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const alreadyInWishlist = await Wishlist.findOne({
    user: userId,
    product: productId,
  });
  if (alreadyInWishlist) {
    req.flash("error", "Product already in wishlist!");
    return res.redirect(`/products/${productId}`);
  }

  const wishlistItem = new Wishlist({ user: userId, product: productId });
  await wishlistItem.save();

  req.flash("success", "Added to wishlist!");
  res.redirect("/wishlist");
});

router.get("", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const userWishlist = await Wishlist.find({ user: userId }).populate(
    "product"
  );
  const validWishlist = userWishlist.filter((item) => item.product !== null);
  res.render("wishlistAndCart/wishlist", { wishlistItems: validWishlist });
});

router.delete("/:productId", isLoggedIn, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  await Wishlist.findOneAndDelete({ user: userId, product: productId });
  req.flash("success", "Removed from wishlist!");
  res.redirect("/wishlist");
});

module.exports = router;
