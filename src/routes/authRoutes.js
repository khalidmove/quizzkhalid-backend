const express = require('express');
const {
    login,
    register,
    sendOTPForforgetpass,
    verifyOTP,
    changePassword,
    changePasswordFromAccount,
    checkPassword,
    getprofile,
    updateprofile,
    fileUpload,
    getnotification
} = require('@controllers/authController');
const authMiddleware = require('@middlewares/authMiddleware');
const { upload } = require("@services/fileUpload");

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.post("/sendOTPForforgetpass", sendOTPForforgetpass);
router.post("/verifyOTP", verifyOTP);
router.post("/changePassword", changePassword);
router.post("/changePasswordFromAccount",authMiddleware(["user", "admin"]), changePasswordFromAccount);
router.post("/checkPassword",authMiddleware(["user", "admin"]), checkPassword);
router.get("/profile", authMiddleware(["user", "admin"]), getprofile);
router.post("/updateprofile", authMiddleware(["user", "admin"]), updateprofile);
router.post("/fileupload", upload.single("file"), fileUpload);
router.get("/getnotification", authMiddleware(["user", "admin"]), getnotification);

module.exports = router;
