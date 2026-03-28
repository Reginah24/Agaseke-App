const express = require("express");
const router = express.Router();
const { requestWithdrawal, approveWithdrawal, getUserWithdrawals, getPendingForCoSigner } = require("../controllers/withdrawalController");
const { auth } = require("../middleware/authMiddleware");

router.post("/withdrawal/request", auth, requestWithdrawal);
router.post("/withdrawal/approve/:id", auth, approveWithdrawal);
//get pending withdrawals for co-signer — must be before /withdrawal/:id to avoid "pending" being matched as :id
router.get("/withdrawal/pending", auth, getPendingForCoSigner);
//get user withdrawals
router.get("/withdrawal", auth, getUserWithdrawals);
module.exports = router;