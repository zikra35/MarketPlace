const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

const sellers = [
  { name: 'Adidas', email: 'adidas@sparkle.com', storeName: 'Adidas Official Store' },
  { name: 'Audionic', email: 'audionic@sparkle.com', storeName: 'Audionic Store' },
  { name: 'Khaadi', email: 'khaadi@sparkle.com', storeName: 'Khaadi Official' },
  { name: 'Sapphire', email: 'sapphire@sparkle.com', storeName: 'Sapphire Store' },
  { name: 'Stylo', email: 'stylo@sparkle.com', storeName: 'Stylo Official' },
  { name: 'Rolex', email: 'rolex@sparkle.com', storeName: 'Rolex Authorized' },
];

const createSellers = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const seller of sellers) {
      const exists = await User.findOne({ email: seller.email });
      if (!exists) {
        await User.create({
          email: seller.email,
          password: '12345678',
          name: seller.name,
          role: 'seller',
          storeName: seller.storeName,
          sellerStatus: 'approved',
        });
        console.log(`✓ Created seller: ${seller.name} (${seller.email})`);
      } else {
        console.log(`✗ Seller already exists: ${seller.name} (${seller.email})`);
      }
    }

    console.log('\n=== Seller Accounts Created ===');
    console.log('Seller Credentials:');
    sellers.forEach(seller => {
      console.log(`  ${seller.name}: ${seller.email} / 12345678`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating sellers:', error);
    process.exit(1);
  }
};

createSellers();
