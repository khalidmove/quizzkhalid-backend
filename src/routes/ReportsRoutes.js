const express = require('express');
const ReportController = require('@controllers/ReportController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.get('/exportQuizData/:quizId',
//   authMiddleware(['admin']),
  ReportController.exportQuizData,);

module.exports = router;
