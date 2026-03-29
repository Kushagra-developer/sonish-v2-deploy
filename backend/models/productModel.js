import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [String], // Array to hold multiple gallery images
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      default: 0, // Used to calculate the discount percentage
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
      }
    ],
    sizeAndFit: {
      type: String,
    },
    sizeChart: {
      type: String, // URL or Base64 of the size guide image
    },
    materialAndCare: {
      type: String,
    },
    specifications: [
      {
        label: { type: String },
        value: { type: String },
      }
    ],
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate SKU before saving if not provided
productSchema.pre('save', async function (next) {
  if (!this.sku) {
    const prefix = (this.category || 'GEN')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3);
    const count = await mongoose.model('Product').countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    this.sku = `SNH-${prefix}-${seq}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;