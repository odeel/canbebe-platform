const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: 'Can Bébé',
    },
    size: {
      type: mongoose.Schema.Types.Mixed, // Number (1-6) or string like 'newborn'
      required: [true, 'Size is required'],
    },
    weightRangeKg: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    categoryName: {
      type: String,
      default: 'couches',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    productUrl: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    sanAlcool: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    externalId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    lastScrapedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.index({ categoryName: 1, size: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);