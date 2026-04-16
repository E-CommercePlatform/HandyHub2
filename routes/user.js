const express = require("express");
const router = express.Router();
const user = require("../models/user");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");

router.get("/signup", (req, res) => {
  res.render("user/signup.ejs", );
});

router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
  let { username, email, password, name } = req.body;
  let newUser = new user({ username, email, name });
  let registerUser = await user.register(newUser, password);
  req.login(registerUser, (err) => {
    if(err) {
        next(err);
    }

    req.flash("success, signup successfully");
    res.redirect("/");
  });
  
  // console.log(registerUser);
}));

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }

        req.flash("success", "logged Out !!");
        res.redirect("/");
    })
})

module.exports = router;
