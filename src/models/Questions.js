"use strict";
const mongoose = require("mongoose");
const QuestionModal = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        category: {
            type: String,
        },
        type: {
            type: String,
        },
        image: {
            type: String,
        },
        question: {
            type: String,
        },
        option: {
            type: Array
        },
        answer: {
            type: String,
        },
        question_number: {
            type: Number
        },
        status: {
            type: String,
            default: 'fresh'
        }
    },
    {
        timestamps: true,
    }
);

QuestionModal.set("toJSON", {
    getters: true,
    virtuals: false,
    transform: (doc, ret, options) => {
        delete ret.__v;
        return ret;
    },
});

module.exports = mongoose.model("Question", QuestionModal);
