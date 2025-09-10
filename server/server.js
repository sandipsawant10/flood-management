const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const User = require("./models/User");
const notificationService = require("./services/notificationService");

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
const authRoutes = require('./routes/auth');
const floodReportRoutes = require('./routes/floodReports');
const alertRoutes = require('./routes/alerts');
const emergencyRoutes = require('./routes/emergency');
const predictionRoutes = require('./routes/predictions');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const adminMunicipalityRoutes = require('./routes/adminMunicipality');
const adminRescuersRoutes = require('./routes/adminRescuers');
const weatherRoutes = require('./routes/weather');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = createServer(app);

// ---------- ALLOWED ORIGINS ----------
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "http://localhost:3000", // CRA (if you still use it)
  process.env.CLIENT_URL, // Production (from .env)
].filter(Boolean);

// ---------- SOCKET.IO SETUP ----------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ---------- EXPRESS MIDDLEWARE ----------
app.set("trust proxy", 1);

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
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/api/", speedLimiter);
app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(sanitizeInput);

// ---------- MONGODB CONNECTION ----------
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

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});

// ---------- SOCKET.IO EVENTS ----------
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join location-based rooms
  socket.on("join-location", (locationData) => {
    const roomName = `location-${locationData.state}-${locationData.district}`;
    socket.join(roomName);
    logger.info(`User ${socket.id} joined room: ${roomName}`);
  });

  // Emergency SOS
  socket.on("emergency-sos", async (data) => {
    logger.warn(`Emergency SOS from ${socket.id}:`, data);
    
    // Emit real-time alert to users in the same location
    io.to(`location-${data.state}-${data.district}`).emit("emergency-alert", {
      type: "SOS",
      location: data.location,
      message: "Emergency SOS signal received",
      timestamp: new Date(),
    });
    
    // Create notifications for nearby users and officials
    try {
      // Find users in the affected area (officials and admins first)
      const nearbyUsers = await User.find({
        'location.state': data.state,
        'location.district': data.district,
        role: { $in: ['official', 'admin'] }
      }).limit(20);
      
      if (nearbyUsers.length > 0) {
        // Create emergency notification
        const notificationData = {
          title: "🆘 Emergency SOS Alert",
          message: `Emergency SOS signal received from ${data.location.address || 'your area'}. Emergency services have been notified.`,
          type: "emergency",
          metadata: {
            location: data.location,
            userId: data.userId || 'anonymous'
          }
        };
        
        // Send notifications to officials and admins
        const recipients = nearbyUsers.map(user => user._id);
        await notificationService.createBulkInAppNotifications(recipients, notificationData);
      }
    } catch (error) {
      logger.error("Failed to create emergency notifications:", error);
      // Continue execution even if notification creation fails
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ---------- HEALTH CHECK ----------
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
    pid: process.pid,
  });
});

// ---------- API DOCUMENTATION ----------
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: "Aqua Assists API Documentation",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// ---------- API ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/flood-reports', floodReportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/municipality', adminMunicipalityRoutes);
app.use('/api/admin/rescuers', adminRescuersRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);

// Import and use notification test routes
const notificationTestRoutes = require('./routes/notificationTest');
app.use("/api/notification-test", notificationTestRoutes);

// ---------- ERROR HANDLING ----------
app.use(notFoundHandler);
app.use(errorHandler);

// ---------- GRACEFUL SHUTDOWN ----------
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
