const mongoose = require('mongoose');

// Use with router.param(...) so a malformed id returns 400 instead of a 500 from a CastError
const validateObjectId = (req, res, next, value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

module.exports = validateObjectId;
