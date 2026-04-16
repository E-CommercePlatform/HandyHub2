const mongoose = require("mongoose");
const schema = mongoose.Schema;
const review = require("./review");
const { ref } = require("joi");

const productSchema = new schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  oldPrice: {
    type: Number,
  },

  price: {
    type: Number,
    required: true,
  },

  mfg: {
    type: String,
    required: true,
  },

   sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
  },
  category: {
    type: String,
    enum: [
      "HomeDecore",
      "jewellery",
      "FashionAccessories",
      "PersonalCare",
      "CraftandDiykit",
      "KitchenItem",
      "HomeMadeFood",
    ],
  },

  reviews: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const product = mongoose.model("product", productSchema);
module.exports = product;
