import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import csv from 'csv-parser';
import Product from './models/productModel.js';
import User from './models/userModel.js';

dotenv.config();

// Helper to clean up WooCommerce HTML descriptions
const cleanDescription = (htmlString) => {
  if (!htmlString) return 'Premium Sonish Collection Item';
  // You can choose to keep the HTML (since your frontend uses dangerouslySetInnerHTML)
  // or strip it. We will keep it so your formatting (bold, lists) is preserved.
  return htmlString;
};

const importCSVData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is missing in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected.');

    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('❌ No admin user found. Please run regular seeder (npm run data:import) first to create the admin.');
      process.exit(1);
    }

    const results = [];
    const csvFilePath = './wc-product-export-20-3-2026-1773966659630.csv'; // Ensure this matches your file name

    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ Cannot find CSV file at ${csvFilePath}. Make sure it is in the backend folder.`);
      process.exit(1);
    }

    console.log('📖 Reading WooCommerce CSV...');

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📊 Found ${results.length} products in CSV. Clearing existing DB products...`);
        await Product.deleteMany();

        const newProducts = results
          .filter(row => row.Name)
          .map(row => {
            // Grab ALL images into an array
            const imageUrls = row.Images ? row.Images.split(',').map(url => url.trim()) : [];
            const primaryImage = imageUrls.length > 0 ? imageUrls[0] : '/images/placeholder.jpg';

            // Clean prices
            const regularPriceStr = row['Regular price'] || '0';
            const salePriceStr = row['Sale price'] || regularPriceStr;
            const originalPrice = parseFloat(regularPriceStr.replace(/,/g, ''));
            const currentPrice = parseFloat(salePriceStr.replace(/,/g, ''));

            const categories = row.Categories ? row.Categories.split(',').map(c => c.trim()) : [];
            const mainCategory = categories.length > 0 ? categories[0] : 'Collections';

            return {
              user: adminUser._id,
              name: row.Name,
              image: primaryImage,
              images: imageUrls, // Save the whole array
              brand: 'Sonish',
              category: mainCategory,
              description: cleanDescription(row.Description || row['Short description']),
              price: currentPrice,
              originalPrice: originalPrice > currentPrice ? originalPrice : currentPrice,
              countInStock: row.Stock ? parseInt(row.Stock) : 50,
              rating: 5,
              numReviews: 1
            };
          });

        await Product.insertMany(newProducts);
        console.log(`🎉 SUCCESS: ${newProducts.length} Products successfully migrated from WooCommerce CSV to MongoDB!`);
        process.exit();
      });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importCSVData();