import Settings from '../models/settingsModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    // Initialize with defaults if none exist
    settings = await Settings.create({ activeFont: "'Inter', sans-serif" });
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

  const { activeFont } = req.body;
  if (activeFont) settings.activeFont = activeFont;

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});
