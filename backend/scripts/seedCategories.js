import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/categoryModel.js';

dotenv.config();

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for category seeding');

    const categories = [
      { name: 'Shirt', parent: 'Women', isActive: true },
      { name: 'Cordset', parent: 'Women', isActive: true },
      { name: 'Kurti', parent: 'Women', isActive: true },
      { name: 'Printed Shirt', parent: 'Women', isActive: true },
      { name: 'Co-ord Set', parent: 'Women', isActive: true },
      { name: 'Short Kurti', parent: 'Women', isActive: true },
      { name: 'Women', parent: '', isActive: true },
      { name: 'Men', parent: '', isActive: true },
    ];

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { name: cat.name },
        { $set: cat },
        { upsert: true, new: true }
      );
      console.log(`✅ Category "${cat.name}" seeded/updated`);
    }

    console.log('🎉 Categories seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding categories: ${error.message}`);
    process.exit(1);
  }
};

seedCategories();
