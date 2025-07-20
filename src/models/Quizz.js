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
    answeredCount: { type: Number, default: 0 },
    backupTimeTaken: { type: Number, default: 0 }, // only if enters backup
    rank: { type: Number, default: null },
    leftAtQuestion: { type: Number, default: null }, // Global question number when left
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    enteredBackup: { type: Boolean, default: false },
    completedBackup: { type: Boolean, default: false },
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
    status: {
      type: String,
      enum: ['used', 'fresh'],
      default: 'fresh',
    },
    scheduledTime: {
      type: String,
    },
    scheduledDate: {
      type: Date,
    },
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
