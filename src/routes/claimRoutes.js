const express = require('express');
const claim = require('@controllers/claimController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.get('/getClaimReward', authMiddleware(["user", "admin"]), claim.getClaimReward);
router.get("/getPendingClaimReward", authMiddleware(["user", "admin"]), claim.getPendingClaimReward);
router.get("/getClaimRewardByUser/:id", authMiddleware(["user", "admin"]), claim.getClaimRewardByUser);

module.exports = router;