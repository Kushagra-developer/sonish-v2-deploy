import Settings from '../models/settingsModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    // Initialize with defaults if none exist
    settings = await Settings.create({ 
      activeFont: "'Inter', sans-serif",
      editorialImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80\u0026w=1200\u0026auto=format\u0026fit=crop"
    });
  }
  
  res.json(settings);
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = new Settings();
  }

const { activeFont, editorialImage } = req.body;
  if (activeFont) settings.activeFont = activeFont;
  if (editorialImage) settings.editorialImage = editorialImage;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});
