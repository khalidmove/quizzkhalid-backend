const express = require('express');
const question = require('@controllers/questionsController');

const router = express.Router();
router.post('/create', question.createQuestion);
router.post('/createmany', question.createmanyQuestions);
router.get("/", question.getQuestions);

router.post("/update", question.updateQuestions);
router.delete("/delete/:id", question.delete);
router.post("/fatchRandomeQuestions", question.fatchRandomeQuestions);

module.exports = router;