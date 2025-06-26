const authRoutes = require("@routes/authRoutes");
const questionRoutes = require("@routes/questionRoute");
const quizzRoutes = require("@routes/quizzRoutes");

module.exports = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/question', questionRoutes);
  app.use('/api/quizz', quizzRoutes);
};

