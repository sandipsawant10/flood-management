const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import middleware
const {
  errorHandler,
  notFoundHandler,
  logger,
} = require("./middleware/errorHandler");
const {
  apiLimiter,
  authLimiter,
  speedLimiter,
  sanitizeInput,
} = require("./middleware/security");
const { specs, swaggerUi } = require("./swagger/swagger");

// Import routes
const authRoutes = require("./routes/auth");
const floodReportRoutes = require("./routes/floodReports");
const alertRoutes = require("./routes/alerts");
const emergencyRoutes = require("./routes/emergency");
const predictionRoutes = require("./routes/predictions");
const userRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const weatherRoutes = require("./routes/weather");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Trust proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Request logging
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Rate limiting
app.use("/api/", speedLimiter);
app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization
app.use(sanitizeInput);

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

// Socket.io setup
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join location-based rooms for targeted alerts
  socket.on("join-location", (locationData) => {
    const roomName = `location-${locationData.state}-${locationData.district}`;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined room: ${roomName}`);
  });

  // Handle emergency SOS
  socket.on("emergency-sos", (data) => {
    logger.warn(`Emergency SOS from ${socket.id}:`, data);
    io.to(`location-${data.state}-${data.district}`).emit("emergency-alert", {
      type: "SOS",
      location: data.location,
      message: "Emergency SOS signal received",
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check with system info
app.get("/api/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
    pid: process.pid,
  };

  res.json(healthCheck);
});

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: "Aqua Assists API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/flood-reports", floodReportRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/weather", weatherRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Aqua Assists Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = { app, io };
