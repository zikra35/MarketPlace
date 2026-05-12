const mongoose = require('mongoose');

const env = require('../config/env');
const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const mockProducts = [
  { name: "Wireless Noise-Cancelling Headphones", price: 79.99, originalPrice: 149.99, discount: 47, rating: 4.5, reviewCount: 2341, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", category: "Electronics", brand: "SoundMax", condition: "new", stockCount: 156, colors: ["Black", "White", "Blue"], description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.", specifications: { "Battery Life": "30 hours", "Driver Size": "40mm", "Bluetooth": "5.3", "Weight": "250g" }, featured: true, flashDeal: true, bestSeller: true },
  { name: "Smart Fitness Watch Pro", price: 129.99, originalPrice: 199.99, discount: 35, rating: 4.3, reviewCount: 1876, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", category: "Electronics", brand: "FitTrack", condition: "new", stockCount: 89, colors: ["Black", "Silver", "Rose Gold"], description: "Advanced fitness tracker with heart rate monitor, GPS, and 7-day battery life.", specifications: { "Display": "1.4\" AMOLED", "Battery": "7 days", "Water Resistance": "5ATM", "Sensors": "HR, SpO2, GPS" }, featured: true, newArrival: true },
  { name: "Premium Cotton T-Shirt", price: 24.99, originalPrice: 39.99, discount: 38, rating: 4.7, reviewCount: 5420, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", category: "Fashion", brand: "UrbanThreads", condition: "new", stockCount: 500, colors: ["White", "Black", "Navy", "Gray"], sizes: ["S", "M", "L", "XL", "XXL"], description: "Ultra-soft 100% organic cotton t-shirt with a modern fit.", specifications: { "Material": "100% Organic Cotton", "Fit": "Regular", "Care": "Machine Wash", "Origin": "Turkey" }, bestSeller: true },
  { name: "Mechanical Gaming Keyboard", price: 59.99, originalPrice: 99.99, discount: 40, rating: 4.6, reviewCount: 3210, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop", category: "Electronics", brand: "KeyMaster", condition: "new", stockCount: 234, colors: ["Black", "White"], description: "RGB mechanical keyboard with hot-swappable switches and aluminum frame.", specifications: { "Switches": "Cherry MX Blue", "Layout": "Full Size", "Backlight": "RGB", "Connection": "USB-C" }, flashDeal: true },
  { name: "Portable Bluetooth Speaker", price: 34.99, originalPrice: 59.99, discount: 42, rating: 4.4, reviewCount: 1543, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", category: "Electronics", brand: "BassBoost", condition: "new", stockCount: 312, colors: ["Black", "Red", "Blue", "Green"], description: "Waterproof portable speaker with 360° sound and 12-hour battery life.", specifications: { "Battery": "12 hours", "Waterproof": "IPX7", "Output": "20W", "Bluetooth": "5.0" }, newArrival: true },
  { name: "Running Shoes Ultra Boost", price: 89.99, originalPrice: 159.99, discount: 44, rating: 4.8, reviewCount: 4102, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Sports", brand: "RunElite", condition: "new", stockCount: 78, colors: ["Black/White", "Red", "Blue"], sizes: ["7", "8", "9", "10", "11", "12"], description: "Lightweight running shoes with responsive cushioning and breathable mesh.", specifications: { "Weight": "280g", "Drop": "10mm", "Sole": "Continental Rubber", "Upper": "Primeknit" }, featured: true, bestSeller: true },
  { name: "Stainless Steel Water Bottle", price: 19.99, originalPrice: 34.99, discount: 43, rating: 4.6, reviewCount: 2890, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop", category: "Home & Garden", brand: "HydroKeep", condition: "new", stockCount: 670, colors: ["Silver", "Black", "Blue", "Pink"], description: "Double-wall vacuum insulated water bottle. Keeps drinks cold 24h or hot 12h.", specifications: { "Capacity": "750ml", "Material": "18/8 Stainless Steel", "Insulation": "24h cold / 12h hot", "BPA Free": "Yes" }, newArrival: true },
  { name: "Wireless Charging Pad", price: 14.99, originalPrice: 29.99, discount: 50, rating: 4.2, reviewCount: 1230, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop", category: "Electronics", brand: "ChargeUp", condition: "new", stockCount: 445, colors: ["Black", "White"], description: "Fast wireless charging pad compatible with all Qi-enabled devices.", specifications: { "Output": "15W Max", "Standard": "Qi", "Input": "USB-C", "LED": "Indicator" }, flashDeal: true },
  { name: "Velvet Matte Lipstick Set", price: 18.99, originalPrice: 34.99, discount: 46, rating: 4.7, reviewCount: 6120, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop", category: "Beauty", brand: "LuxeLips", condition: "new", stockCount: 890, colors: ["Rose", "Berry", "Nude", "Coral"], description: "Long-lasting velvet matte lipstick set with 6 gorgeous shades. Hydrating formula that doesn't dry out lips.", specifications: { "Finish": "Velvet Matte", "Pieces": "6", "Duration": "12 hours", "Cruelty Free": "Yes" }, bestSeller: true, flashDeal: true },
  { name: "Rose Gold Makeup Brush Set", price: 24.99, originalPrice: 49.99, discount: 50, rating: 4.8, reviewCount: 4350, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", category: "Beauty", brand: "BrushArt", condition: "new", stockCount: 567, colors: ["Rose Gold", "Pink"], description: "Professional 15-piece makeup brush set with soft synthetic bristles and elegant rose gold handles.", specifications: { "Pieces": "15", "Bristles": "Synthetic", "Handle": "Rose Gold Metal", "Case": "Included" }, featured: true, newArrival: true },
  { name: "Hydrating Face Serum - Vitamin C", price: 22.99, originalPrice: 39.99, discount: 43, rating: 4.6, reviewCount: 3890, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop", category: "Beauty", brand: "GlowUp", condition: "new", stockCount: 345, colors: ["Default"], description: "Brightening Vitamin C serum with hyaluronic acid for glowing, hydrated skin. Suitable for all skin types.", specifications: { "Volume": "30ml", "Key Ingredient": "20% Vitamin C", "Skin Type": "All", "Paraben Free": "Yes" }, bestSeller: true },
  { name: "Floral Midi Wrap Dress", price: 39.99, originalPrice: 69.99, discount: 43, rating: 4.5, reviewCount: 2780, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop", category: "Fashion", brand: "BloomWear", condition: "new", stockCount: 234, colors: ["Pink", "Blue", "White"], sizes: ["XS", "S", "M", "L", "XL"], description: "Elegant floral midi wrap dress perfect for brunch, dates, or casual outings. Lightweight and flowy fabric.", specifications: { "Material": "Polyester Blend", "Length": "Midi", "Closure": "Wrap Tie", "Season": "Spring/Summer" }, featured: true, newArrival: true },
  { name: "Pearl Drop Earrings", price: 15.99, originalPrice: 29.99, discount: 47, rating: 4.7, reviewCount: 5210, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop", category: "Fashion", brand: "PearlEssence", condition: "new", stockCount: 780, colors: ["Gold", "Silver", "Rose Gold"], description: "Classic freshwater pearl drop earrings with hypoallergenic posts. Timeless elegance for any occasion.", specifications: { "Material": "Sterling Silver", "Pearl": "Freshwater", "Size": "10mm", "Hypoallergenic": "Yes" }, bestSeller: true },
  { name: "Silk Hair Scrunchie Set", price: 12.99, originalPrice: 24.99, discount: 48, rating: 4.4, reviewCount: 3450, image: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=400&h=400&fit=crop", category: "Beauty", brand: "SilkSoft", condition: "new", stockCount: 1200, colors: ["Pink", "Black", "White", "Blue"], description: "Set of 8 pure mulberry silk scrunchies. Gentle on hair, prevents breakage and frizz.", specifications: { "Material": "100% Mulberry Silk", "Pieces": "8", "Size": "Standard", "Hair Safe": "Yes" }, flashDeal: true },
  { name: "Crossbody Designer Handbag", price: 49.99, originalPrice: 89.99, discount: 44, rating: 4.6, reviewCount: 1890, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", category: "Fashion", brand: "ChicCarry", condition: "new", stockCount: 156, colors: ["Pink", "Black", "White", "Brown"], description: "Elegant crossbody bag with gold chain strap. Perfect everyday bag with multiple compartments.", specifications: { "Material": "Vegan Leather", "Strap": "Gold Chain", "Pockets": "3", "Closure": "Magnetic Snap" }, featured: true },
  { name: "Scented Candle Gift Set", price: 28.99, originalPrice: 44.99, discount: 36, rating: 4.8, reviewCount: 4100, image: "https://images.unsplash.com/photo-1602607650474-a6ee5d3a9a3c?w=400&h=400&fit=crop", category: "Home & Garden", brand: "AromaBliss", condition: "new", stockCount: 567, colors: ["Rose", "Lavender", "Vanilla"], description: "Luxury scented candle set with 3 floral fragrances. Hand-poured soy wax with cotton wicks.", specifications: { "Wax": "Natural Soy", "Burn Time": "45 hours each", "Pieces": "3", "Fragrance": "Rose, Lavender, Vanilla" }, newArrival: true, bestSeller: true },
  { name: "Eyeshadow Palette - Sunset Vibes", price: 21.99, originalPrice: 42.99, discount: 49, rating: 4.5, reviewCount: 5670, image: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=400&h=400&fit=crop", category: "Beauty", brand: "ColorPop", condition: "new", stockCount: 432, colors: ["Warm Tones", "Cool Tones"], description: "18-shade eyeshadow palette with mattes, shimmers, and glitters. Highly pigmented and blendable.", specifications: { "Shades": "18", "Finishes": "Matte, Shimmer, Glitter", "Mirror": "Included", "Vegan": "Yes" }, flashDeal: true, featured: true },
  { name: "Oversized Sunglasses - Cat Eye", price: 16.99, originalPrice: 32.99, discount: 48, rating: 4.3, reviewCount: 2340, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop", category: "Fashion", brand: "ShadeQueen", condition: "new", stockCount: 670, colors: ["Black", "Brown", "Pink"], description: "Retro oversized cat eye sunglasses with UV400 protection. Lightweight and stylish.", specifications: { "UV Protection": "UV400", "Frame": "Acetate", "Lens": "Polycarbonate", "Weight": "28g" }, newArrival: true },
  { name: "Jade Roller & Gua Sha Set", price: 14.99, originalPrice: 29.99, discount: 50, rating: 4.6, reviewCount: 3780, image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400&h=400&fit=crop", category: "Beauty", brand: "JadeGlow", condition: "new", stockCount: 890, colors: ["Green", "Pink"], description: "Natural jade face roller and gua sha tool set for facial massage, de-puffing, and lymphatic drainage.", specifications: { "Material": "Natural Jade", "Pieces": "2", "Case": "Velvet Pouch", "Use": "Face & Neck" }, flashDeal: true },
  { name: "Lace Trim Satin Pajama Set", price: 34.99, originalPrice: 59.99, discount: 42, rating: 4.7, reviewCount: 2100, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop", category: "Fashion", brand: "DreamSilk", condition: "new", stockCount: 345, colors: ["Pink", "Black", "White", "Champagne"], sizes: ["XS", "S", "M", "L", "XL"], description: "Luxurious satin pajama set with delicate lace trim. Soft, breathable, and perfect for cozy nights.", specifications: { "Material": "Satin Polyester", "Pieces": "2 (Top + Bottom)", "Care": "Hand Wash", "Trim": "French Lace" }, bestSeller: true },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Don't delete products - keep real data from database
    // await Product.deleteMany({});

    const adminExists = await User.findOne({ email: 'admin@sparkle.com' });
    let adminUser;
    if (!adminExists) {
      adminUser = await User.create({
        email: 'admin@sparkle.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Created admin user: admin@sparkle.com');
    } else {
      adminUser = adminExists;
    }

    const sellerExists = await User.findOne({ email: 'seller@sparkle.com' });
    let sellerUser;
    if (!sellerExists) {
      sellerUser = await User.create({
        email: 'seller@sparkle.com',
        password: 'Seller@123',
        name: 'Default Seller',
        role: 'seller',
        storeName: 'Sparkle Store',
        sellerStatus: 'approved',
      });
      console.log('Created seller user: seller@sparkle.com');
    } else {
      sellerUser = sellerExists;
    }

    const customerExists = await User.findOne({ email: 'customer@sparkle.com' });
    if (!customerExists) {
      await User.create({
        email: 'customer@sparkle.com',
        password: 'Customer@123',
        name: 'Test Customer',
        phone: '555-1234',
        address: '123 Main St, Springfield',
        role: 'customer',
      });
      console.log('Created customer user: customer@sparkle.com');
    }

    // Don't seed products - only use real data added by sellers
    console.log('\n=== Seeding Complete ===');
    console.log('Admin Credentials:');
    console.log('  Email: admin@sparkle.com');
    console.log('  Password: Admin@123');
    console.log('\nSeller Credentials:');
    console.log('  Email: seller@sparkle.com');
    console.log('  Password: Seller@123');
    console.log('\nCustomer Credentials:');
    console.log('  Email: customer@sparkle.com');
    console.log('  Password: Customer@123');
    console.log('\nNote: Products are not seeded. Only real data from sellers will be displayed.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();



