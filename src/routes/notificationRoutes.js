const express = require('express');
const notification = require('@controllers/notificationController');

const router = express.Router();
router.post('/create', notification.create);
router.get("/getNoti", notification.getNoti);

module.exports = router;