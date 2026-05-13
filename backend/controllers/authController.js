import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";

// Temporary in-memory pending registrations
// key: normalizedEmail -> { username, password, createdAt }
const pendingRegistrations = new Map();
const PENDING_TTL_MS = 15 * 60 * 1000; // 15 minutes

const isStrongPassword = (password = "") => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const isValidEmailFormat = (email = "") => {
  const atIndex = email.indexOf("@");
  const lastAtIndex = email.lastIndexOf("@");
  const lastDotIndex = email.lastIndexOf(".");
  return (
    atIndex > 0 &&
    atIndex === lastAtIndex &&
    lastDotIndex > atIndex + 1 &&
    lastDotIndex < email.length - 1
  );
};

const getSupabasePublicClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase env missing: SUPABASE_URL and/or SUPABASE_ANON_KEY");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

const getPendingRegistration = (email) => {
  const pending = pendingRegistrations.get(email);
  if (!pending) return null;

  const isExpired = Date.now() - pending.createdAt > PENDING_TTL_MS;
  if (isExpired) {
    pendingRegistrations.delete(email);
    return null;
  }
  return pending;
};

// @desc    Register user (PENDING only) + send OTP
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!username || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already in use",
      });
    }

    pendingRegistrations.delete(normalizedEmail);
    pendingRegistrations.set(normalizedEmail, {
      username: username.trim(),
      password,
      createdAt: Date.now(),
    });

    const supabasePublic = getSupabasePublicClient();

    const { data, error } = await supabasePublic.auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    });

    if (error) {
      console.error("SUPABASE_REGISTER_ERROR:", error);
      pendingRegistrations.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: error.message || "Supabase OTP error",
        code: error.code || null,
        status: error.status || null,
        details: error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify to complete registration.",
      data,
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

// @desc    Verify email OTP and CREATE Mongo user
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and code are required",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = getPendingRegistration(normalizedEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        error: "No pending registration found or OTP expired. Please register again.",
        statusCode: 400,
      });
    }

    const supabasePublic = getSupabasePublicClient();

    const { error } = await supabasePublic.auth.verifyOtp({
      email: normalizedEmail,
      token: code.trim(),
      type: "email",
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
        statusCode: 400,
      });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        username: pending.username,
        email: normalizedEmail,
        password: pending.password,
        isVerified: true,
        supabaseUserId: null,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    pendingRegistrations.delete(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: "Email verified and account created successfully.",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    if (error.message?.includes("Supabase env missing")) {
      return res.status(500).json({
        success: false,
        error: error.message,
        statusCode: 500,
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email/username and password",
        statusCode: 400,
      });
    }

    const query = email
      ? { email: email.toLowerCase().trim() }
      : { username: username.trim() };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before logging in.",
        statusCode: 403,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      token,
      message: "User logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;

    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) user.email = email.toLowerCase().trim();
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Please provide current and new password",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
        statusCode: 401,
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, you will receive password reset instructions shortly.",
    };

    if (!normalizedEmail || !isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const clientBaseUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
      const resetUrl = `${clientBaseUrl}/reset-password/${resetToken}`;

      try {
        await sendPasswordResetEmail({
          to: user.email,
          username: user.username,
          resetUrl,
        });
      } catch (emailError) {
        console.error("FORGOT_PASSWORD_EMAIL_ERROR:", emailError);
      }
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, you will receive password reset instructions shortly.",
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Reset token is required",
        statusCode: 400,
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        statusCode: 400,
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Reset token is invalid or has expired",
        statusCode: 400,
      });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to reset password. Please try again.",
      statusCode: 500,
    });
  }
};
