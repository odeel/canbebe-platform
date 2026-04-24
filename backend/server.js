require("dotenv").config({
  path: require("path").resolve(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// =======================
// DB CONNECTION
// =======================
connectDB();

// =======================
// APP INIT
// =======================
const app = express();

// =======================
// MIDDLEWARES
// =======================
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3002"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =======================
// ROUTES (CANBEBE CORE)
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/baby", require("./routes/babyRoutes"));
app.use("/api/vaccination", require("./routes/vaccinationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/blog", require("./routes/blogRoutes"));
app.use("/api/faq", require("./routes/faqRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/community", require("./routes/postRoutes"));

// =======================
// HEALTH CHECK
// =======================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CanBebe API is running",
    timestamp: new Date().toISOString(),
  });
});

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} introuvable`,
  });
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur interne",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 CanBebe server running on port ${PORT} (${process.env.NODE_ENV})`
  );
});