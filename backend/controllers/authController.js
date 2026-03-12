const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

const sendVerificationEmail = async (email, token) => {
  const appUrl = process.env.APP_URL || 'http://localhost:5000';
  const link = `${appUrl}/api/auth/verify-email?token=${token}`;
  if (!process.env.SMTP_USER) {
    console.log(`[DEV] Verification link for ${email}: ${link}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Verify your Agaseke account',
    html: `
      <h2>Welcome to Agaseke!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#1565C0;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a>
      <p>Or copy this link into your browser:</p>
      <p>${link}</p>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

exports.register = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    let { name, email, password, coSignerEmail } = req.body
    // normalize emails to avoid matching issues (trim + lowercase)
    email = String(email || "").trim().toLowerCase();
    coSignerEmail = String(coSignerEmail || "").trim().toLowerCase();

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    if (!EMAIL_RE.test(coSignerEmail)) {
      return res.status(400).json({ error: 'Invalid co-signer email address.' });
    }
    if (email === coSignerEmail) {
      return res.status(400).json({ error: 'Co-signer email must be different from your own email.' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    //check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: 'User already exists' })

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({ name, email, password, coSignerEmail, verificationToken, isVerified: false })
    await user.save()

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (mailErr) {
      console.error('Failed to send verification email:', mailErr.message);
    }

    res.status(201).json({ message: 'Account created. Please check your email to verify your account before signing in.' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.login = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    let { email, password } = req.body
    // normalize email for lookup
    email = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' })

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified. Please check your inbox and click the verification link before signing in.', code: 'EMAIL_NOT_VERIFIED' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
exports.verifyEmail = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Verification token is required.' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired verification link.' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2 style="color:#1565C0;">&#10003; Email Verified!</h2>
        <p>Your Agaseke account is now active. You can sign in to the app.</p>
      </body></html>
    `);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    let { email } = req.body;
    email = String(email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with that email.' });
    if (user.isVerified) return res.status(400).json({ error: 'This account is already verified.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (mailErr) {
      console.error('Failed to resend verification email:', mailErr.message);
    }

    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get user profile
exports.getProfile = async (req, res) => {
    // #swagger.tags = ['Auth']
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
