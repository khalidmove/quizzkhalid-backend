const express = require('express');
const notification = require('@controllers/notificationController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post('/create', notification.create);
router.get("/getNoti", notification.getNoti);
router.get("/getnotification", authMiddleware(["user", "admin"]), notification.getnotification);

module.exports = router;