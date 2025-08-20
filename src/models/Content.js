"use strict";

const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
    {
        termsAndConditions: {
            type: String,
        },
        privacy: {
            type: String,
        },
        about_us: {
            type: String,
        },
        contact_us: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model("Content", contentSchema);
