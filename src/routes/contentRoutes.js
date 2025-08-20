const express = require('express');
const content = require('@controllers/contentController');

const router = express.Router();
router.post('/createContent', content.createContent);
router.get("/getContent", content.getContent);

module.exports = router;