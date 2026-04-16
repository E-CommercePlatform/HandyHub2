const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("Wishlist", wishlistSchema);