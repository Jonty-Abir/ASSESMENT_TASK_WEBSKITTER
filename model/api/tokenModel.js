const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    token: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: 86400000,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

const TokenModel = new mongoose.model("token", TokenSchema);
module.exports = { TokenModel };
