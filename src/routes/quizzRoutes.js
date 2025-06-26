const express = require('express');
const quizz = require('@controllers/quizzController');

const router = express.Router();
router.post('/create', quizz.create);
router.get("/", quizz.get);
router.get("/:id", quizz.getbyId);
router.post("/update", quizz.update);
router.delete("/delete/:id", quizz.delete);

module.exports = router;