const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new schema({
    name: String,
    email: {type: String, unique: true, required: true},
    googleId: String,
    // wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);