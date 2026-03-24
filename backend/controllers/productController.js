import Product from '../models/productModel.js';

// @desc    Fetch all IN-STOCK products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const products = await Product.find({ countInStock: { $gt: 0 } });
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const product = new Product({
    name: req.body.name || 'Sample name',
    price: req.body.price || 0,
    originalPrice: req.body.originalPrice || 0,
    user: req.user._id,
    image: req.body.images && req.body.images.length > 0 ? req.body.images[0] : '/images/sample.webp',
    images: req.body.images || ['/images/sample.webp'],
    brand: req.body.brand || 'Sonish',
    category: req.body.category || 'Sample Category',
    countInStock: req.body.countInStock || 0,
    sizes: req.body.sizes || [],
    numReviews: 0,
    description: req.body.description || 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, price, originalPrice, description, image, images, brand, category, countInStock, sizes } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.description = description || product.description;
    product.image = image || product.image;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.sizes = sizes || product.sizes;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
};

const getAdminProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

export { getProducts, getProductById, createProduct, updateProduct, getAdminProducts };