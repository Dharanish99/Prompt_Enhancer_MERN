import crypto from "crypto";
import User from "../models/User.js";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = generateOTP();
  const hash = crypto.createHash("sha256").update(otp).digest("hex");

  const user =
    (await User.findOne({ email })) ||
    (await User.create({ email }));

  user.otpHash = hash;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  // 🔐 Replace this with email service later
  console.log(`OTP for ${email}: ${otp}`);

  res.json({ success: true });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otpHash) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  const hash = crypto.createHash("sha256").update(otp).digest("hex");

  if (hash !== user.otpHash || user.otpExpiresAt < Date.now()) {
    return res.status(401).json({ error: "OTP expired or invalid" });
  }

  user.otpHash = null;
  user.otpExpiresAt = null;
  await user.save();

  req.session.userId = user._id;

  res.json({ success: true });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("promptstudio.sid");
    res.json({ success: true });
  });
};

export const me = async (req, res) => {
  const user = await User.findById(req.session.userId).select("email");
  res.json(user);
};
