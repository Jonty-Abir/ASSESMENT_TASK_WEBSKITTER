const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    mobileNo: { type: String },
    avatar: {
      type: String,
      require: true,
      default: "user.png",
      get: (avatar) => `${process.env.SERVER_URL}${avatar}`,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
      require: true,
    },
    answer: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);
const UserModel = mongoose.model("User", UserSchema);

module.exports = { UserModel };
