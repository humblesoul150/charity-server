const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { connectDb } = require("./configs/connectDb.js");
 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

// parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS
if (CLIENT_URL) {
  // If you set CLIENT_URL, allow credentials (cookies/auth) from that origin
  app.use(
    cors({
      origin: CLIENT_URL,
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
} else {
  // No client origin specified: allow any origin but do NOT allow credentials
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    })
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
const blogRoutes = require("./routes/blogRoutes");
const eventRoutes = require("./routes/eventRoutes.js");
const staffRoutes = require("./routes/staffRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling middleware (must be last)
// app.use(errorHandler);

// Connect to DB, then start server
connectDb(process.env.DB_URL)
  .then(() => {
    // logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // logger.error('Failed to start server due to DB connection error:', err);
    console.error('Failed to start server due to DB connection error:', err.message);
    process.exit(1);
  });
 


 
 