const express = require('express');
const {
    login,
    register,
    sendOTPForforgetpass,
    verifyOTP,
    changePassword,
    getprofile,
    updateprofile,
    fileUpload
} = require('@controllers/authController');
const authMiddleware = require('@middlewares/authMiddleware');
const { upload } = require("@services/fileUpload");

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTPForforgetpass", sendOTPForforgetpass);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);
router.get("/profile", authMiddleware(["user", "admin"]), getprofile);
router.post("/updateprofile", authMiddleware(["user", "admin"]), updateprofile);
router.post("/fileupload", upload.single("file"), fileUpload);

module.exports = router;
