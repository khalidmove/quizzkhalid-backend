"use strict";

const mongoose = require("mongoose");
const claimRewardSchema = new mongoose.Schema(
  {
    req_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    points: {
      type: Number,
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Approved'],
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

claimRewardSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("ClaimReward", claimRewardSchema);
