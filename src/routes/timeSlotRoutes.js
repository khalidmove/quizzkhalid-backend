const express = require('express');
const time = require('@controllers/timeController');

const router = express.Router();
router.post('/createTimeSlot', time.createTimeSlot);
router.get("/getAllTimeSlots", time.getAllTimeSlots);
// router.get("/:id", time.getbyId);
router.post("/updateTimeSlot/:id", time.updateTimeSlot);
router.delete("/deleteTimeSlot/:id", time.deleteTimeSlot);

module.exports = router;