require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const user = require("./models/user");
const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const localStrategy = require("passport-local");
const productRouter = require("./routes/product");
const reviewRouter = require("./routes/rating");
const wishlistRouter = require("./routes/wishlist");
const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");
const dashBoardRouter = require("./routes/dashboard");
const sellRouter = require("./routes/sell");
const orderRoute = require("./routes/order");
const contactRoute = require("./routes/contact");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public/css")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(flash());

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOpt = {
  store,
  secret: "mysecret", //A string used to sign the session ID cookie for security.
  resave: false, //Ensures the session is not saved to the session store on every request if nothing has changed
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOpt));
app.use(passport.initialize()); //Initializes Passport for authentication.
app.use(passport.session()); // Integrates Passport with Express sessions to store user authentication data in sessions.

passport.use(new localStrategy(user.authenticate()));
// passport.use(new googleStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser()); //Converts the user object into a session-storable format (e.g., user ID).
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/user/dashboard", (req, res) => {
//   res.render("user/dashBoard.ejs");
// })

app.use("/products", productRouter);
app.use("/products/:id/reviews", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use(userRouter);
app.use("/cart", cartRouter);
app.use(dashBoardRouter);
app.use("/sell", sellRouter);
app.use("/order", orderRoute);
app.use("/contact", contactRoute);

app.get("/wishlist", (req, res) => {
  res.render("wishlistAndCart/wishlist.ejs");
});

// home page
app.get("/", (req, res) => {
  res.render("product/home");
});

// app.listen(port, () => {
//   console.log("app is listening to the port 8080");
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Bad request"));
// })

app.use((err, req, res, next) => {
  let { statusCode = "500", message = "something went wrong" } = err;
  res.status(statusCode).send(message);
});
