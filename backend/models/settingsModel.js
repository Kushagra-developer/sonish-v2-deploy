import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  activeFont: {
    type: String,
    default: "'Inter', sans-serif"
  },
  editorialImage: {
    type: String,
    default: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80\u0026w=1200\u0026auto=format\u0026fit=crop"
  },
  // We can add more site-wide settings here later (e.g. primaryColor, announcementBar)
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
