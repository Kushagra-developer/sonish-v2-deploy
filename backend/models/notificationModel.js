import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  size: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'notified'],
    default: 'pending'
  }
}, { timestamps: true });

// Prevent duplicate notifications for same user/product/size
notificationSchema.index({ product: 1, email: 1, size: 1 }, { unique: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
