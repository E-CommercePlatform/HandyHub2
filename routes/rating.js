const review = require("../models/review");
const express = require("express");
const product = require("../models/product");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");

// rating
router.post("", wrapAsync(async (req, res) => {
  let { id } = req.params;  // Extracting product ID from the URL params
  let reviewProduct = await product.findById(id)  // Finding product by ID and populating its reviews
  console.log(reviewProduct);
  // let reviewProduct = await product.findById(id).populate("reviews");
  let newReview = new review(req.body.review);  // Creating a new review using data from the request body
  newReview.author = req.user._id;
  console.log(newReview);
  reviewProduct.reviews.push(newReview);  // Adding the new review to the product's reviews array
  await reviewProduct.save();  // Saving the updated product with the new review
  await newReview.save();  // Saving the new review itself
  res.redirect(`/products/${id}`);  // Redirecting to the product page
}));

// review delete route
// router.delete("/:reviewId", wrapAsync(async (req, res) => {
//   let { id, reviewId } = req.params; 
//   if(!review.author.equal(res.locals.currUser._id)){
//     req.flash("error", "you are not the author of this review");
//     res.redirect(`/products/${id}`)
//   } else {
//     let deleteReview = await review.findByIdAndDelete(reviewId);
//     deleteObjId = await product.findByIdAndUpdate(id, {
//       $pull: { reviews: reviewId },
//     });
//     res.redirect(`/products/${id}`);
//   }
// }));

router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  const foundReview = await review.findById(reviewId);
  if (!foundReview) {
    req.flash("error", "Review not found!");
    return res.redirect(`/products/${id}`);
  }
  if (!foundReview.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/products/${id}`);
  }
  await review.findByIdAndDelete(reviewId);
  await product.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  res.redirect(`/products/${id}`);
}));


module.exports = router;