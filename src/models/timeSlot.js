"use strict";

const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    // endTime: {
    //   type: String,
    //   required: true,
    // },
    status: {
      type: Boolean,
      default: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

module.exports = TimeSlot;
