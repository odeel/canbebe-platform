// backend/config/db.js
// Clean MongoDB connection (GridFS removed)

const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

// ── Main mongoose connection ──
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected: ${conn.connection.host}");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error: ${error.message}");
    process.exit(1);
  }
};

module.exports = { connectDB };