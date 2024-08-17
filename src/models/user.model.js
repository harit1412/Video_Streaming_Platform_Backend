const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(mongooseAggregatePaginate);

// Kind of middleware
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  console.log(password , this.password);
  
  return await bcrypt.compare(password, this.password);;
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.access_token_secret,
    {
      expiresIn: process.env.access_token_expiry,
    }
  );
};

UserSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
          _id: this._id,
        },
        process.env.refresh_token_secret,
        {
          expiresIn: process.env.refresh_token_expiry,
        }
      );
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
