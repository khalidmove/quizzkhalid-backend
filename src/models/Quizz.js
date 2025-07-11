'use strict';
const mongoose = require('mongoose');
const OptionSchema = new mongoose.Schema(
  {
    name: { type: String },
    ans: { type: String },
    count: {
      type: Number,
      default: 0,
    },
  },
  //   { _id: false },
);

const QuestionSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String },
    category: { type: String },
    image: { type: String },
    question: { type: String },
    answer: { type: String },
    question_number: { type: Number },
    option: [OptionSchema],
  },
  //   { _id: false },
);
const LevelSchema = new mongoose.Schema({
  level: String,
  que: [QuestionSchema],
});
const QuizzModal = new mongoose.Schema(
  {
    users: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    isAvailable: {
      type: Boolean,
    },
  },
],

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
    questions: [LevelSchema],
    usedQuestions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }],
  },
  {
    timestamps: true,
  },
);

QuizzModal.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Quizz', QuizzModal);
