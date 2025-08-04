const express = require('express');
const setting = require('@controllers/settingController');

const router = express.Router();
router.post("/createsetting", setting.createSetting);
router.get("/getsetting", setting.getSetting);
router.post("/updatesetting",setting.updateSetting)


module.exports = router;

