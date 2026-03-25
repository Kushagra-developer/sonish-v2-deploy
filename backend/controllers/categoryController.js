import Category from '../models/categoryModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all active categories (public)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  res.json(categories);
});

// @desc    Get all categories (admin)
// @route   GET /api/categories/admin
// @access  Private/Admin
const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ order: 1 });
  res.json(categories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, order } = req.body;

  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description: description || '',
    image: image || '',
    order: order || 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
  });

  res.status(201).json(category);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    const { name, description, image, isActive, order } = req.body;
    category.name = name !== undefined ? name : category.name;
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.isActive = isActive !== undefined ? isActive : category.isActive;
    category.order = order !== undefined ? order : category.order;

    const updated = await category.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export { getCategories, getAdminCategories, createCategory, updateCategory, deleteCategory };
