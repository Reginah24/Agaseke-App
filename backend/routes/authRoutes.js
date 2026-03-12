const express = require("express");
const router = express.Router();
const { register, login, getProfile } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

router.post("/auth/register", register);
router.post("/auth/login", login);
//get user profile
router.get("/auth/me", auth, getProfile);

module.exports = router;
