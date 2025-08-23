"use strict";

const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
    for: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

notificationSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
