import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // Name is not strictly required if logging in via phone initially.
      required: false,
    },
    email: {
      type: String,
      // Email is not required for phone-only users.
      required: false,
      unique: true,
      sparse: true, // Allows multiple null/undefined values
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: false, // Not required for OTP users
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    wishlist: {
      type: Array,
      default: [],
    },
    shippingAddress: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    savedAddresses: [
      {
        address: String,
        city: String,
        postalCode: String,
        country: String,
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Method to verify passwords on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hook to hash password before saving if it has been modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
