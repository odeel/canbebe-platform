const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Original ID from scraper source
    externalId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    // Diaper size number (1-6) or 'newborn'
    size: {
      type: mongoose.Schema.Types.Mixed, // Number or String
      required: true,
    },
    // Min/max weight in kg this size fits
    weightRangeKg: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    categoryName: {
      type: String,
      default: 'couches',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    productUrl: {
      type: String,
      default: null,
    },
    // Price in DZD
    price: {
      type: Number,
      default: null,
    },
    // Alcohol-free flag — required for cultural compliance
    sanAlcool: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Last time scraper updated this product
    lastScrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ size: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);