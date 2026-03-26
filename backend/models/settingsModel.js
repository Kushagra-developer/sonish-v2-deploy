import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  activeFont: {
    type: String,
    default: "'Inter', sans-serif"
  },
  // We can add more site-wide settings here later (e.g. primaryColor, announcementBar)
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
