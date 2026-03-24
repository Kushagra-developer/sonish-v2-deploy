import Banner from '../models/bannerModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all active banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
  res.json(banners);
});

// @desc    Get all banners (Admin)
// @route   GET /api/banners/admin
// @access  Private/Admin
const getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({ order: 1 });
  res.json(banners);
});

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { image, title, subtitle, description, link, order } = req.body;

  const banner = new Banner({
    image,
    title,
    subtitle,
    description,
    link: link || '/collections',
    order: order || 0,
    isActive: true,
  });

  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const { image, title, subtitle, description, link, isActive, order } = req.body;

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    banner.image = image !== undefined ? image : banner.image;
    banner.title = title !== undefined ? title : banner.title;
    banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
    banner.description = description !== undefined ? description : banner.description;
    banner.link = link !== undefined ? link : banner.link;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;
    banner.order = order !== undefined ? order : banner.order;

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

export {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
