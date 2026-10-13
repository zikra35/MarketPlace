const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');

// Default 'lax' works when the frontend calls the API through the Vercel /api proxy
// (same domain). Set COOKIE_SAMESITE=none only if the frontend calls Railway directly.
const cookieOptions = () => {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { password, name, role, storeName } = req.body;
    const email = normalizeEmail(req.body.email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = new User({
      email,
      password,
      name,
      role: role || 'customer',
    });

    if (user.role === 'seller') {
      user.sellerStatus = 'pending';
      user.storeName = typeof storeName === 'string' ? storeName.trim() : '';
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Set both tokens in cookies
    res.cookie('accessToken', accessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    // Don't send accessToken in response body (it's in httpOnly cookie)
    return res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    // Works even if the access token already expired: identify the user by the refresh cookie
    const decoded = req.cookies?.refreshToken ? verifyRefreshToken(req.cookies.refreshToken) : null;
    if (decoded) {
      await User.updateOne({ _id: decoded.userId }, { $set: { refreshToken: null } });
    }

    // Clear BOTH cookies - leaving accessToken behind kept the user logged in for up to 15 minutes
    res.clearCookie('accessToken', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions());
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.clearCookie('accessToken', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions());
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing or invalid' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }

    const newAccessToken = generateAccessToken(user._id);
    
    // Set new access token in cookie
    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions(),
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(200).json({ success: true, data: { accessToken: newAccessToken, user: userResponse } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token expired' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { password, name } = req.body;
    const email = normalizeEmail(req.body.email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const user = new User({
      email,
      password,
      name,
      role: 'admin',
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  createAdmin,
};
