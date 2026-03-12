const express = require("express");
const router = express.Router();
const { register, login, getProfile, verifyEmail, resendVerification } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerification);
//get user profile
router.get("/auth/me", auth, getProfile);

module.exports = router;
