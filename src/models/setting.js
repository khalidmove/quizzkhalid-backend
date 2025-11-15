"use strict";

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    carousel: [
      {
        image: {
          type: String,
        },
      },
    ],
    referelpoint: {
      type: Number,
      default: 10,
    },
    quiztime: {
      type: Number,
      default: 15,
    },
  },
  {
    timestamps: true,
  }
);
settingSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Setting", settingSchema);
