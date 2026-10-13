const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Check for token in Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies?.accessToken) {
      // Fallback to httpOnly cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = authenticate;
