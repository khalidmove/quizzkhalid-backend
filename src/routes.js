const authRoutes = require("@routes/authRoutes");
const questionRoutes = require("@routes/questionRoute");
const quizzRoutes = require("@routes/quizzRoutes");
const categoruRoutes = require("@routes/categoruRoutes");
const timeSlotRoutes = require("@routes/timeSlotRoutes");

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/question', questionRoutes);
  app.use('/api/quizz', quizzRoutes);
  app.use('/api/category', categoruRoutes);
  app.use('/api/time', timeSlotRoutes);
};

