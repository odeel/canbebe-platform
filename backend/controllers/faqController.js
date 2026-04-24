const FAQ = require('../models/FAQ');

// GET /api/faq  — public, returns active FAQs + mocked defaults merged
exports.getFAQ = async (req, res, next) => {
  try {
    const dbFaqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, faq: dbFaqs });
  } catch (err) { next(err); }
};

// GET /api/faq/admin  — admin, returns ALL FAQs including inactive
exports.getAllFAQAdmin = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, faq: faqs });
  } catch (err) { next(err); }
};

// POST /api/faq  — admin, create new FAQ
exports.createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, isActive, order } = req.body;
    if (!question || !answer)
      return res.status(400).json({ success: false, error: 'question and answer required.' });

    const faq = await FAQ.create({ question, answer, category, isActive, order });
    res.status(201).json({ success: true, faq });
  } catch (err) { next(err); }
};

// PUT /api/faq/:id  — admin, update FAQ
exports.updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found.' });
    res.json({ success: true, faq });
  } catch (err) { next(err); }
};

// DELETE /api/faq/:id  — admin
exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};