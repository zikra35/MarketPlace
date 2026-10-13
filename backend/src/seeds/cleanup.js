const mongoose = require('mongoose');
const env = require('../config/env');
const Product = require('../models/Product');

const cleanup = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} products from database`);

    console.log('\n=== Cleanup Complete ===');
    console.log('All seeded products have been removed.');
    console.log('Only real products added by sellers will be displayed.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

cleanup();
