const express = require('express');
const quizz = require('@controllers/quizzController');
const authMiddleware = require('@middlewares/authMiddleware');
const { getCronStatus, dailyOptionResetCron } = require('../cron/quizCron');

const router = express.Router();
router.post('/create', quizz.create);
router.get("/", quizz.get);
router.get("/:id", quizz.getbyId);
router.post("/update", quizz.update);
router.delete("/delete/:id", quizz.delete);
router.get("/addUserToQuiz/:id", authMiddleware(["user", "admin"]),quizz.addUserToQuiz);
router.get("/removeUserFromQuiz/:id", authMiddleware(["user", "admin"]),quizz.removeUserFromQuiz);
router.post("/submitanswer", quizz.submitanswer);
router.get("/fetchBackupQuestion/:id", quizz.fetchBackupQuestion);

// router.post("/reset-used-questions", authMiddleware(["admin"]), quizz.resetUsedQuestions);
// router.get("/question-usage-stats", authMiddleware(["admin"]), quizz.getQuestionUsageStats);

router.get("/cron/status", authMiddleware(["admin"]), (req, res) => {
  try {
    const status = getCronStatus();
    res.json({
      status: true,
      data: {
        message: "Cron job status retrieved successfully",
        cronJobs: status
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error retrieving cron status",
      error: error.message
    });
  }
});

router.post("/cron/trigger-reset", authMiddleware(["admin"]), async (req, res) => {
  try {
    // Manual trigger @ranjan2digit
    const result = await require('@models/Quizz').updateMany(
      {},
      {
        $set: {
          'questions.$[].que.$[].option.$[].count': 0
        }
      }
    );
    
    res.json({
      status: true,
      data: {
        message: "Option count reset triggered manually",
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Error triggering manual reset",
      error: error.message
    });
  }
});

module.exports = router;