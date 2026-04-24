const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// GET /api/products?search=&category=&activeOnly=true
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, activeOnly, size } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.isActive = true;
    if (category) filter.categoryName = { $regex: category, $options: 'i' };
    if (size) filter.size = isNaN(size) ? size : Number(size);
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { categoryName: { $regex: search, $options: 'i' } },
    ];

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) { next(err); }
};

// GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// POST /api/products - with image upload
exports.createProduct = async (req, res, next) => {
  try {
    const { name, brand, size, weightRangeKg, categoryName, productUrl, price, sanAlcool } = req.body;

    if (!name || size === undefined)
      return res.status(400).json({ success: false, error: 'name and size required.' });

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      // Store relative path that can be served by Express
      imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      brand,
      size,
      weightRangeKg: weightRangeKg ? JSON.parse(weightRangeKg) : undefined,
      categoryName: categoryName || 'couches',
      imageUrl,
      productUrl,
      price: price ? Number(price) : null,
      sanAlcool: sanAlcool !== 'false',
    });

    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

// PUT /api/products/:id - with optional image upload
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Handle image upload
    if (req.file) {
      updates.imageUrl = `/uploads/products/${req.file.filename}`;

      // Delete old image if exists
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.imageUrl && oldProduct.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', oldProduct.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Parse weightRangeKg if it's a string
    if (updates.weightRangeKg && typeof updates.weightRangeKg === 'string') {
      updates.weightRangeKg = JSON.parse(updates.weightRangeKg);
    }

    updates.lastScrapedAt = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found.' });

    // Delete associated image if exists
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};