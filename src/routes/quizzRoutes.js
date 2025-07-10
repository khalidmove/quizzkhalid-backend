const express = require('express');
const quizz = require('@controllers/quizzController');
const authMiddleware = require('@middlewares/authMiddleware');

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

module.exports = router;