import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateAdmin = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri && uri.includes('?')) {
      // Remove query params if they cause issues with older drivers
      uri = uri.split('?')[0];
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected for admin update');

    const adminEmail = 'connect@sonish.co.in';
    const adminPassword = 'sonish@1234';

    // Find if an admin already exists or update the existing one
    let admin = await User.findOne({ isAdmin: true });

    if (admin) {
      console.log(`Updating existing admin: ${admin.email}`);
      admin.email = adminEmail;
      admin.password = adminPassword;
      admin.name = 'Sonish Admin';
      await admin.save();
      console.log('Admin updated successfully');
    } else {
      console.log('No admin found, creating a new one');
      admin = new User({
        name: 'Sonish Admin',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });
      await admin.save();
      console.log('New admin created successfully');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateAdmin();
