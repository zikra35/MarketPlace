export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  seller: string;
  sellerVerified: boolean;
  category: string;
  brand: string;
  condition: "New" | "Used" | "Refurbished";
  inStock: boolean;
  stockCount: number;
  colors: string[];
  sizes?: string[];
  description: string;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export const categories = [
  "Electronics", "Fashion", "Home & Garden", "Sports", "Books",
  "Beauty", "Toys", "Automotive", "Health", "Groceries"
];

export const products: Product[] = [
  {
    id: "1", name: "Wireless Noise-Cancelling Headphones", price: 79.99, originalPrice: 149.99, discount: 47,
    rating: 4.5, reviewCount: 2341, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    seller: "AudioTech Pro", sellerVerified: true, category: "Electronics", brand: "SoundMax",
    condition: "New", inStock: true, stockCount: 156, colors: ["Black", "White", "Blue"],
    description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
    specifications: { "Battery Life": "30 hours", "Driver Size": "40mm", "Bluetooth": "5.3", "Weight": "250g" },
    isFeatured: true, isFlashDeal: true, isBestSeller: true,
  },
  {
    id: "2", name: "Smart Fitness Watch Pro", price: 129.99, originalPrice: 199.99, discount: 35,
    rating: 4.3, reviewCount: 1876, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    seller: "FitGear Hub", sellerVerified: true, category: "Electronics", brand: "FitTrack",
    condition: "New", inStock: true, stockCount: 89, colors: ["Black", "Silver", "Rose Gold"],
    description: "Advanced fitness tracker with heart rate monitor, GPS, and 7-day battery life.",
    specifications: { "Display": "1.4\" AMOLED", "Battery": "7 days", "Water Resistance": "5ATM", "Sensors": "HR, SpO2, GPS" },
    isFeatured: true, isNewArrival: true,
  },
  {
    id: "3", name: "Premium Cotton T-Shirt", price: 24.99, originalPrice: 39.99, discount: 38,
    rating: 4.7, reviewCount: 5420, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    seller: "StyleVault", sellerVerified: true, category: "Fashion", brand: "UrbanThreads",
    condition: "New", inStock: true, stockCount: 500, colors: ["White", "Black", "Navy", "Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Ultra-soft 100% organic cotton t-shirt with a modern fit.",
    specifications: { "Material": "100% Organic Cotton", "Fit": "Regular", "Care": "Machine Wash", "Origin": "Turkey" },
    isBestSeller: true,
  },
  {
    id: "4", name: "Mechanical Gaming Keyboard", price: 59.99, originalPrice: 99.99, discount: 40,
    rating: 4.6, reviewCount: 3210, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    seller: "GameZone", sellerVerified: false, category: "Electronics", brand: "KeyMaster",
    condition: "New", inStock: true, stockCount: 234, colors: ["Black", "White"],
    description: "RGB mechanical keyboard with hot-swappable switches and aluminum frame.",
    specifications: { "Switches": "Cherry MX Blue", "Layout": "Full Size", "Backlight": "RGB", "Connection": "USB-C" },
    isFlashDeal: true,
  },
  {
    id: "5", name: "Portable Bluetooth Speaker", price: 34.99, originalPrice: 59.99, discount: 42,
    rating: 4.4, reviewCount: 1543, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    seller: "AudioTech Pro", sellerVerified: true, category: "Electronics", brand: "BassBoost",
    condition: "New", inStock: true, stockCount: 312, colors: ["Black", "Red", "Blue", "Green"],
    description: "Waterproof portable speaker with 360° sound and 12-hour battery life.",
    specifications: { "Battery": "12 hours", "Waterproof": "IPX7", "Output": "20W", "Bluetooth": "5.0" },
    isNewArrival: true,
  },
  {
    id: "6", name: "Running Shoes Ultra Boost", price: 89.99, originalPrice: 159.99, discount: 44,
    rating: 4.8, reviewCount: 4102, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    seller: "SportEdge", sellerVerified: true, category: "Sports", brand: "RunElite",
    condition: "New", inStock: true, stockCount: 78, colors: ["Black/White", "Red", "Blue"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    description: "Lightweight running shoes with responsive cushioning and breathable mesh.",
    specifications: { "Weight": "280g", "Drop": "10mm", "Sole": "Continental Rubber", "Upper": "Primeknit" },
    isFeatured: true, isBestSeller: true,
  },
  {
    id: "7", name: "Stainless Steel Water Bottle", price: 19.99, originalPrice: 34.99, discount: 43,
    rating: 4.6, reviewCount: 2890, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    seller: "EcoLife Store", sellerVerified: true, category: "Home & Garden", brand: "HydroKeep",
    condition: "New", inStock: true, stockCount: 670, colors: ["Silver", "Black", "Blue", "Pink"],
    description: "Double-wall vacuum insulated water bottle. Keeps drinks cold 24h or hot 12h.",
    specifications: { "Capacity": "750ml", "Material": "18/8 Stainless Steel", "Insulation": "24h cold / 12h hot", "BPA Free": "Yes" },
    isNewArrival: true,
  },
  {
    id: "8", name: "Wireless Charging Pad", price: 14.99, originalPrice: 29.99, discount: 50,
    rating: 4.2, reviewCount: 1230, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
    seller: "TechDeal", sellerVerified: false, category: "Electronics", brand: "ChargeUp",
    condition: "New", inStock: true, stockCount: 445, colors: ["Black", "White"],
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    specifications: { "Output": "15W Max", "Standard": "Qi", "Input": "USB-C", "LED": "Indicator" },
    isFlashDeal: true,
  },
  {
    id: "9", name: "Velvet Matte Lipstick Set", price: 18.99, originalPrice: 34.99, discount: 46,
    rating: 4.7, reviewCount: 6120, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "LuxeLips",
    condition: "New", inStock: true, stockCount: 890, colors: ["Rose", "Berry", "Nude", "Coral"],
    description: "Long-lasting velvet matte lipstick set with 6 gorgeous shades. Hydrating formula that doesn't dry out lips.",
    specifications: { "Finish": "Velvet Matte", "Pieces": "6", "Duration": "12 hours", "Cruelty Free": "Yes" },
    isBestSeller: true, isFlashDeal: true,
  },
  {
    id: "10", name: "Rose Gold Makeup Brush Set", price: 24.99, originalPrice: 49.99, discount: 50,
    rating: 4.8, reviewCount: 4350, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "BrushArt",
    condition: "New", inStock: true, stockCount: 567, colors: ["Rose Gold", "Pink"],
    description: "Professional 15-piece makeup brush set with soft synthetic bristles and elegant rose gold handles.",
    specifications: { "Pieces": "15", "Bristles": "Synthetic", "Handle": "Rose Gold Metal", "Case": "Included" },
    isFeatured: true, isNewArrival: true,
  },
  {
    id: "11", name: "Hydrating Face Serum - Vitamin C", price: 22.99, originalPrice: 39.99, discount: 43,
    rating: 4.6, reviewCount: 3890, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    seller: "SkinGlow Co", sellerVerified: true, category: "Beauty", brand: "GlowUp",
    condition: "New", inStock: true, stockCount: 345, colors: ["Default"],
    description: "Brightening Vitamin C serum with hyaluronic acid for glowing, hydrated skin. Suitable for all skin types.",
    specifications: { "Volume": "30ml", "Key Ingredient": "20% Vitamin C", "Skin Type": "All", "Paraben Free": "Yes" },
    isBestSeller: true,
  },
  {
    id: "12", name: "Floral Midi Wrap Dress", price: 39.99, originalPrice: 69.99, discount: 43,
    rating: 4.5, reviewCount: 2780, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop",
    seller: "StyleVault", sellerVerified: true, category: "Fashion", brand: "BloomWear",
    condition: "New", inStock: true, stockCount: 234, colors: ["Pink", "Blue", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Elegant floral midi wrap dress perfect for brunch, dates, or casual outings. Lightweight and flowy fabric.",
    specifications: { "Material": "Polyester Blend", "Length": "Midi", "Closure": "Wrap Tie", "Season": "Spring/Summer" },
    isFeatured: true, isNewArrival: true,
  },
  {
    id: "13", name: "Pearl Drop Earrings", price: 15.99, originalPrice: 29.99, discount: 47,
    rating: 4.7, reviewCount: 5210, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop",
    seller: "JewelCraft", sellerVerified: true, category: "Fashion", brand: "PearlEssence",
    condition: "New", inStock: true, stockCount: 780, colors: ["Gold", "Silver", "Rose Gold"],
    description: "Classic freshwater pearl drop earrings with hypoallergenic posts. Timeless elegance for any occasion.",
    specifications: { "Material": "Sterling Silver", "Pearl": "Freshwater", "Size": "10mm", "Hypoallergenic": "Yes" },
    isBestSeller: true,
  },
  {
    id: "14", name: "Silk Hair Scrunchie Set", price: 12.99, originalPrice: 24.99, discount: 48,
    rating: 4.4, reviewCount: 3450, image: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=400&h=400&fit=crop",
    seller: "SilkDream", sellerVerified: true, category: "Beauty", brand: "SilkSoft",
    condition: "New", inStock: true, stockCount: 1200, colors: ["Pink", "Black", "White", "Blue"],
    description: "Set of 8 pure mulberry silk scrunchies. Gentle on hair, prevents breakage and frizz.",
    specifications: { "Material": "100% Mulberry Silk", "Pieces": "8", "Size": "Standard", "Hair Safe": "Yes" },
    isFlashDeal: true,
  },
  {
    id: "15", name: "Crossbody Designer Handbag", price: 49.99, originalPrice: 89.99, discount: 44,
    rating: 4.6, reviewCount: 1890, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
    seller: "LuxeBags", sellerVerified: true, category: "Fashion", brand: "ChicCarry",
    condition: "New", inStock: true, stockCount: 156, colors: ["Pink", "Black", "White", "Brown"],
    description: "Elegant crossbody bag with gold chain strap. Perfect everyday bag with multiple compartments.",
    specifications: { "Material": "Vegan Leather", "Strap": "Gold Chain", "Pockets": "3", "Closure": "Magnetic Snap" },
    isFeatured: true,
  },
  {
    id: "16", name: "Scented Candle Gift Set", price: 28.99, originalPrice: 44.99, discount: 36,
    rating: 4.8, reviewCount: 4100, image: "https://images.unsplash.com/photo-1602607650474-a6ee5d3a9a3c?w=400&h=400&fit=crop",
    seller: "CozyHome", sellerVerified: true, category: "Home & Garden", brand: "AromaBliss",
    condition: "New", inStock: true, stockCount: 567, colors: ["Rose", "Lavender", "Vanilla"],
    description: "Luxury scented candle set with 3 floral fragrances. Hand-poured soy wax with cotton wicks.",
    specifications: { "Wax": "Natural Soy", "Burn Time": "45 hours each", "Pieces": "3", "Fragrance": "Rose, Lavender, Vanilla" },
    isNewArrival: true, isBestSeller: true,
  },
  {
    id: "17", name: "Eyeshadow Palette - Sunset Vibes", price: 21.99, originalPrice: 42.99, discount: 49,
    rating: 4.5, reviewCount: 5670, image: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "ColorPop",
    condition: "New", inStock: true, stockCount: 432, colors: ["Warm Tones", "Cool Tones"],
    description: "18-shade eyeshadow palette with mattes, shimmers, and glitters. Highly pigmented and blendable.",
    specifications: { "Shades": "18", "Finishes": "Matte, Shimmer, Glitter", "Mirror": "Included", "Vegan": "Yes" },
    isFlashDeal: true, isFeatured: true,
  },
  {
    id: "18", name: "Oversized Sunglasses - Cat Eye", price: 16.99, originalPrice: 32.99, discount: 48,
    rating: 4.3, reviewCount: 2340, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop",
    seller: "SunStyle", sellerVerified: false, category: "Fashion", brand: "ShadeQueen",
    condition: "New", inStock: true, stockCount: 670, colors: ["Black", "Brown", "Pink"],
    description: "Retro oversized cat eye sunglasses with UV400 protection. Lightweight and stylish.",
    specifications: { "UV Protection": "UV400", "Frame": "Acetate", "Lens": "Polycarbonate", "Weight": "28g" },
    isNewArrival: true,
  },
  {
    id: "19", name: "Jade Roller & Gua Sha Set", price: 14.99, originalPrice: 29.99, discount: 50,
    rating: 4.6, reviewCount: 3780, image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400&h=400&fit=crop",
    seller: "SkinGlow Co", sellerVerified: true, category: "Beauty", brand: "JadeGlow",
    condition: "New", inStock: true, stockCount: 890, colors: ["Green", "Pink"],
    description: "Natural jade face roller and gua sha tool set for facial massage, de-puffing, and lymphatic drainage.",
    specifications: { "Material": "Natural Jade", "Pieces": "2", "Case": "Velvet Pouch", "Use": "Face & Neck" },
    isFlashDeal: true,
  },
  {
    id: "20", name: "Lace Trim Satin Pajama Set", price: 34.99, originalPrice: 59.99, discount: 42,
    rating: 4.7, reviewCount: 2100, image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
    seller: "SilkDream", sellerVerified: true, category: "Fashion", brand: "DreamSilk",
    condition: "New", inStock: true, stockCount: 345, colors: ["Pink", "Black", "White", "Champagne"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Luxurious satin pajama set with delicate lace trim. Soft, breathable, and perfect for cozy nights.",
    specifications: { "Material": "Satin Polyester", "Pieces": "2 (Top + Bottom)", "Care": "Hand Wash", "Trim": "French Lace" },
    isBestSeller: true,
  },
  {
    id: "21", name: "Hair Curling Wand - Ceramic", price: 32.99, originalPrice: 54.99, discount: 40,
    rating: 4.4, reviewCount: 4560, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "CurlPro",
    condition: "New", inStock: true, stockCount: 278, colors: ["Pink", "Black", "Rose Gold"],
    description: "Professional ceramic curling wand with adjustable temperature. Creates bouncy, long-lasting curls.",
    specifications: { "Barrel": "25mm Ceramic", "Temp Range": "120-230°C", "Heat Up": "30 seconds", "Auto Shut-off": "60 min" },
    isNewArrival: true,
  },
  {
    id: "22", name: "Dainty Gold Layered Necklace Set", price: 19.99, originalPrice: 39.99, discount: 50,
    rating: 4.8, reviewCount: 6780, image: "https://images.unsplash.com/photo-1599643478518-a76f7e5c5488?w=400&h=400&fit=crop",
    seller: "JewelCraft", sellerVerified: true, category: "Fashion", brand: "GoldCharm",
    condition: "New", inStock: true, stockCount: 456, colors: ["Gold", "Silver", "Rose Gold"],
    description: "Set of 3 delicate layered necklaces with star, moon, and heart pendants. Tarnish-resistant plating.",
    specifications: { "Material": "18K Gold Plated", "Pieces": "3", "Chain Length": "16/18/20 inch", "Tarnish Resistant": "Yes" },
    isFeatured: true, isBestSeller: true,
  },
  {
    id: "23", name: "Sheet Mask Variety Pack", price: 16.99, originalPrice: 28.99, discount: 41,
    rating: 4.5, reviewCount: 8920, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop",
    seller: "SkinGlow Co", sellerVerified: true, category: "Beauty", brand: "MaskBar",
    condition: "New", inStock: true, stockCount: 1500, colors: ["Default"],
    description: "12-pack Korean sheet masks with different ingredients: collagen, tea tree, aloe, hyaluronic acid, and more.",
    specifications: { "Pieces": "12", "Ingredients": "Natural Extracts", "Skin Type": "All", "Country": "South Korea" },
    isFlashDeal: true,
  },
  {
    id: "24", name: "Platform Sneakers - White", price: 44.99, originalPrice: 79.99, discount: 44,
    rating: 4.3, reviewCount: 1670, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
    seller: "SportEdge", sellerVerified: true, category: "Fashion", brand: "StepUp",
    condition: "New", inStock: true, stockCount: 234, colors: ["White", "Pink", "Black"],
    sizes: ["5", "6", "7", "8", "9", "10"],
    description: "Trendy platform sneakers with cushioned sole. Perfect for casual streetwear and everyday comfort.",
    specifications: { "Sole": "4cm Platform", "Material": "Faux Leather", "Closure": "Lace-up", "Insole": "Memory Foam" },
    isNewArrival: true,
  },
  {
    id: "25", name: "Flower Print Tote Bag", price: 22.99, originalPrice: 39.99, discount: 43,
    rating: 4.5, reviewCount: 2340, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
    seller: "LuxeBags", sellerVerified: true, category: "Fashion", brand: "FloralChic",
    condition: "New", inStock: true, stockCount: 456, colors: ["Pink", "Blue", "White"],
    description: "Spacious floral tote bag with inner zip pocket. Great for work, shopping, or beach days.",
    specifications: { "Material": "Canvas", "Size": "40x35x12 cm", "Closure": "Magnetic Snap", "Pockets": "3" },
    isBestSeller: true,
  },
  {
    id: "26", name: "Nail Polish Gel Set", price: 19.99, originalPrice: 36.99, discount: 46,
    rating: 4.6, reviewCount: 5430, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "GelGlam",
    condition: "New", inStock: true, stockCount: 678, colors: ["Pink", "Red", "Nude", "Berry"],
    description: "Professional gel nail polish set with 8 trendy colors. Long-lasting up to 3 weeks with no chipping.",
    specifications: { "Pieces": "8", "Type": "UV Gel", "Duration": "Up to 21 days", "Lamp Required": "Yes" },
    isFlashDeal: true,
  },
  {
    id: "27", name: "Rose Quartz Water Bottle", price: 26.99, originalPrice: 44.99, discount: 40,
    rating: 4.7, reviewCount: 1890, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    seller: "EcoLife Store", sellerVerified: true, category: "Home & Garden", brand: "CrystalSip",
    condition: "New", inStock: true, stockCount: 345, colors: ["Pink", "Clear"],
    description: "Glass water bottle with removable rose quartz crystal point. Infuse your water with positive energy.",
    specifications: { "Capacity": "550ml", "Material": "Borosilicate Glass", "Crystal": "Rose Quartz", "BPA Free": "Yes" },
    isNewArrival: true,
  },
  {
    id: "28", name: "Fleece-Lined Cozy Blanket - Pink", price: 29.99, originalPrice: 49.99, discount: 40,
    rating: 4.8, reviewCount: 3210, image: "https://images.unsplash.com/photo-1580141515590-4dd1c9e46fba?w=400&h=400&fit=crop",
    seller: "CozyHome", sellerVerified: true, category: "Home & Garden", brand: "SnuggleNest",
    condition: "New", inStock: true, stockCount: 567, colors: ["Pink", "Lavender", "Cream", "Gray"],
    description: "Ultra-soft sherpa fleece blanket. Perfect for movie nights and cozy winter evenings.",
    specifications: { "Size": "150x200 cm", "Material": "Microfiber Sherpa", "Weight": "600 GSM", "Machine Washable": "Yes" },
    isBestSeller: true,
  },
  {
    id: "29", name: "Perfume Gift Set - Floral Notes", price: 38.99, originalPrice: 64.99, discount: 40,
    rating: 4.5, reviewCount: 2670, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "FloraScent",
    condition: "New", inStock: true, stockCount: 234, colors: ["Default"],
    description: "Luxury perfume gift set with 4 mini fragrances: rose, jasmine, peony, and gardenia. Perfect gift idea.",
    specifications: { "Pieces": "4", "Volume": "15ml each", "Notes": "Floral", "Longevity": "6-8 hours" },
    isFeatured: true,
  },
  {
    id: "30", name: "High-Waist Yoga Leggings", price: 27.99, originalPrice: 49.99, discount: 44,
    rating: 4.6, reviewCount: 7890, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop",
    seller: "SportEdge", sellerVerified: true, category: "Sports", brand: "FlexFit",
    condition: "New", inStock: true, stockCount: 890, colors: ["Black", "Pink", "Navy", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Buttery-soft high-waist yoga leggings with tummy control. Squat-proof and moisture-wicking.",
    specifications: { "Material": "Nylon/Spandex", "Rise": "High Waist", "Squat Proof": "Yes", "Moisture Wicking": "Yes" },
    isBestSeller: true, isNewArrival: true,
  },
  {
    id: "31", name: "Makeup Vanity Mirror with LED", price: 34.99, originalPrice: 59.99, discount: 42,
    rating: 4.7, reviewCount: 3450, image: "https://images.unsplash.com/photo-1585412459212-ca91a13fba76?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "LightGlam",
    condition: "New", inStock: true, stockCount: 234, colors: ["White", "Pink", "Rose Gold"],
    description: "Hollywood-style vanity mirror with 12 LED bulbs. Touch dimmer with 3 color modes for perfect makeup application.",
    specifications: { "Bulbs": "12 LED", "Modes": "Warm/Cool/Natural", "Size": "30x40 cm", "Power": "USB/Battery" },
    isFeatured: true,
  },
  {
    id: "32", name: "Butterfly Hair Claw Clips Set", price: 9.99, originalPrice: 19.99, discount: 50,
    rating: 4.4, reviewCount: 8760, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    seller: "SilkDream", sellerVerified: true, category: "Beauty", brand: "ClipChic",
    condition: "New", inStock: true, stockCount: 2300, colors: ["Pink", "Brown", "Black", "Clear"],
    description: "Set of 12 aesthetic butterfly claw clips in assorted colors. Strong grip for thick and thin hair.",
    specifications: { "Pieces": "12", "Material": "Acrylic", "Size": "Medium", "Hair Type": "All" },
    isFlashDeal: true,
  },
  {
    id: "33", name: "Satin Pillowcase Set", price: 17.99, originalPrice: 32.99, discount: 45,
    rating: 4.8, reviewCount: 5670, image: "https://images.unsplash.com/photo-1631049035634-c1db22ef5933?w=400&h=400&fit=crop",
    seller: "SilkDream", sellerVerified: true, category: "Home & Garden", brand: "SleekSleep",
    condition: "New", inStock: true, stockCount: 678, colors: ["Pink", "White", "Gray", "Champagne"],
    description: "Set of 2 silky satin pillowcases. Reduces hair frizz and prevents sleep creases on skin.",
    specifications: { "Pieces": "2", "Material": "Satin Polyester", "Size": "Standard 20x26 inch", "Closure": "Envelope" },
    isBestSeller: true,
  },
  {
    id: "34", name: "Pastel Acrylic Nail Kit", price: 23.99, originalPrice: 42.99, discount: 44,
    rating: 4.3, reviewCount: 2340, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "NailArt",
    condition: "New", inStock: true, stockCount: 345, colors: ["Pastel Pink", "Lavender", "Mint", "Peach"],
    description: "Complete acrylic nail kit with pastel powders, liquid monomer, and tools. DIY salon nails at home.",
    specifications: { "Pieces": "24", "Colors": "6 Pastels", "Tools": "Brush, File, Forms", "Level": "Beginner Friendly" },
    isNewArrival: true,
  },
  {
    id: "35", name: "Boho Beaded Bracelet Stack", price: 13.99, originalPrice: 24.99, discount: 44,
    rating: 4.5, reviewCount: 3120, image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
    seller: "JewelCraft", sellerVerified: true, category: "Fashion", brand: "BeadBliss",
    condition: "New", inStock: true, stockCount: 890, colors: ["Gold", "Pink", "White"],
    description: "Set of 5 stackable boho-chic beaded bracelets. Mix of natural stones, pearls, and gold-tone beads.",
    specifications: { "Pieces": "5", "Material": "Natural Stone & Beads", "Size": "Adjustable", "Style": "Bohemian" },
    isNewArrival: true,
  },
  {
    id: "36", name: "Korean Skincare Starter Set", price: 42.99, originalPrice: 74.99, discount: 43,
    rating: 4.9, reviewCount: 4560, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    seller: "SkinGlow Co", sellerVerified: true, category: "Beauty", brand: "K-Glow",
    condition: "New", inStock: true, stockCount: 234, colors: ["Default"],
    description: "5-step Korean skincare routine: cleanser, toner, essence, serum, and moisturizer. For dewy glass skin.",
    specifications: { "Steps": "5", "Skin Type": "All", "Key Ingredients": "Snail Mucin, Niacinamide", "Cruelty Free": "Yes" },
    isFeatured: true, isBestSeller: true,
  },
  {
    id: "37", name: "Mini Backpack - Quilted", price: 31.99, originalPrice: 54.99, discount: 42,
    rating: 4.4, reviewCount: 1890, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    seller: "LuxeBags", sellerVerified: true, category: "Fashion", brand: "ChicCarry",
    condition: "New", inStock: true, stockCount: 178, colors: ["Pink", "Black", "White", "Lavender"],
    description: "Adorable quilted mini backpack with adjustable straps. Compact yet fits essentials for a day out.",
    specifications: { "Material": "Vegan Leather", "Size": "25x20x10 cm", "Pockets": "4", "Closure": "Zipper" },
    isNewArrival: true,
  },
  {
    id: "38", name: "Moisturizing Lip Gloss Set", price: 11.99, originalPrice: 22.99, discount: 48,
    rating: 4.6, reviewCount: 6540, image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&h=400&fit=crop",
    seller: "GlamourBox", sellerVerified: true, category: "Beauty", brand: "GlossGirl",
    condition: "New", inStock: true, stockCount: 1200, colors: ["Clear", "Pink", "Berry", "Peach"],
    description: "Ultra-glossy, non-sticky lip gloss set with 4 shades. Infused with vitamin E and coconut oil.",
    specifications: { "Pieces": "4", "Finish": "High Shine", "Hydrating": "Vitamin E + Coconut Oil", "Cruelty Free": "Yes" },
    isFlashDeal: true,
  },
];

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize?: string;
}

export const heroSlides = [
  { id: 1, title: "Mega Sale Event", subtitle: "Up to 70% off on Electronics", cta: "Shop Now", bg: "gradient-navy" },
  { id: 2, title: "New Arrivals", subtitle: "Discover the latest trends in Fashion", cta: "Explore", bg: "gradient-orange" },
  { id: 3, title: "Flash Deals", subtitle: "Limited time offers — Don't miss out!", cta: "View Deals", bg: "gradient-navy" },
];
