const express = require('express');
const ReportController = require('@controllers/ReportController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.get('/exportQuizData/:quizId',authMiddleware(['admin']),ReportController.exportQuizData,);
router.get('/exportUserReport',authMiddleware(['admin']),ReportController.exportUserReport,);
router.get('/exportQuestionReport',authMiddleware(['admin']),ReportController.exportQuestionReport,);
router.get('/exportQuizUserReport/:quizId',authMiddleware(['admin']),ReportController.exportQuizUserReport,);
router.get('/exportNotifications',authMiddleware(['admin']),ReportController.exportNotifications,);
router.get('/exportLeaderboard',authMiddleware(['admin']),ReportController.exportLeaderboard,);
router.get('/exportClaimReport',authMiddleware(['admin']),ReportController.exportClaimReport,);

module.exports = router;
