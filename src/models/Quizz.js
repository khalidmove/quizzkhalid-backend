"use strict";
const mongoose = require("mongoose");
const QuizzModal = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        category: {
            type: String,
        },
        image: {
            type: String,
        },
        limit: {
            type: Number,
        },
        questions: {
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);

QuizzModal.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Quizz", QuizzModal);
