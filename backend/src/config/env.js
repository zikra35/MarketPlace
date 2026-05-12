require('dotenv').config();

const env = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/shop-sparkle',
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_key',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

module.exports = env;
