const Withdrawal = require("../models/withdrawalModel");
const Saving = require("../models/savingModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

// Create transporter using SMTP from env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

// helper to escape regex special chars when building case-insensitive match
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.requestWithdrawal = async (req, res) => {
  // #swagger.tags = ['Withdrawal']
  try {
    // FIX 3: extract reason alongside amount and validate it
    const { amount, reason } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number." });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: "A reason for the withdrawal is required." });
    }

    const saving = await Saving.findOne({ userId: req.user.id });
    if (!saving) {
      return res.status(404).json({ error: "No saving goal found for this user." });
    }

    if (Number(amount) > saving.currentAmount) {
      return res.status(400).json({
        error: "Insufficient funds in saving goal. You can withdraw up to " + saving.currentAmount,
      });
    }

    // FIX 3: store reason in the withdrawal document
    const withdrawal = new Withdrawal({
      userId: req.user.id,
      amount: Number(amount),
      reason: String(reason).trim(),
      status: "pending",
    });

    await withdrawal.save();
    console.log(`Withdrawal created: id=${withdrawal._id} user=${req.user.id} amount=${amount}`);

    // send email to co-signer if transporter is configured
    try {
      const user = await User.findById(req.user.id);
      console.log(`Requester user: ${user._id} email=${user.email} coSignerEmail=${user.coSignerEmail}`);
      const coSignerEmail = user.coSignerEmail;
      if (coSignerEmail && transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: coSignerEmail,
          subject: `Withdrawal request from ${user.name}`,
          text: `User ${user.name} (${user.email}) has requested a withdrawal of ${amount} RWF.\n\nReason: ${reason}\n\nPlease log into the Agaseke app to approve or reject this request.`,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (mailErr) {
      console.error("Failed to send co-signer email:", mailErr.message || mailErr);
    }

    res.status(201).json({ message: "Withdrawal request sent to co-signer" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FIX 2: wrapped entire function in try/catch so bad IDs or DB errors
// return a clean 500 instead of crashing the server
exports.approveWithdrawal = async (req, res) => {
  // #swagger.tags = ['Withdrawal']
  try {
    const statusOptions = ["approved", "rejected"];
    const { status } = req.body;
    if (!statusOptions.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id).populate(
      "userId",
      "name email coSignerEmail"
    );

    // FIX 2: guard against withdrawal not found (invalid ID)
    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }

    const user = withdrawal.userId;

    // Ensure the logged-in user is the co-signer (compare case-insensitive, trimmed)
    const storedCo = String(user.coSignerEmail || "").trim().toLowerCase();
    const requesterCo = String(req.user.email || "").trim().toLowerCase();
    if (storedCo !== requesterCo) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if withdrawal is already processed
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: "Withdrawal already processed" });
    }

    withdrawal.status = status;
    await withdrawal.save();

    if (status === "rejected") {
      return res.json({ message: "Withdrawal rejected" });
    }

    // Deduct from user's savings on approval
    const saving = await Saving.findOne({ userId: user._id });
    if (saving && saving.currentAmount >= withdrawal.amount) {
      saving.currentAmount -= withdrawal.amount;
      await saving.save();
    }

    res.json({ message: "Withdrawal approved and processed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserWithdrawals = async (req, res) => {
  // #swagger.tags = ['Withdrawal']
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingForCoSigner = async (req, res) => {
  // #swagger.tags = ['Withdrawal']
  try {
    console.log(`getPendingForCoSigner called by ${req.user.email}`);
    const cosignerEmail = String(req.user.email || "").trim();
    const users = await User.find({
      coSignerEmail: { $regex: `^${escapeRegex(cosignerEmail)}$`, $options: "i" },
    });
    console.log(`Found ${users.length} users with coSignerEmail=${cosignerEmail}`);
    const userIds = users.map((u) => u._id);

    const withdrawals = await Withdrawal.find({
      userId: { $in: userIds },
      status: "pending",
    }).populate("userId", "name email");
    console.log(`Found ${withdrawals.length} pending withdrawals for co-signer ${cosignerEmail}`);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};