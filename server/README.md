# Flood Disaster Management System - Backend

## Overview
This is the backend server for the Flood Disaster Management System. It provides RESTful APIs, real-time communication, and notification services to support the flood disaster management platform.

## Features

- **Authentication & Authorization**: Secure user authentication with JWT and role-based access control
- **Flood Reports API**: Create, read, update, and delete flood reports with image upload
- **Alert System**: Generate and manage flood alerts with severity levels
- **Notification Service**: Multi-channel notifications (in-app, email, SMS)
- **Analytics**: Data aggregation and analysis for flood trends and statistics
- **Emergency Services**: SOS handling and emergency resource coordination
- **Weather Integration**: External weather API integration
- **Real-time Communication**: WebSocket-based real-time updates

## Tech Stack

- **Node.js & Express**: Server framework
- **MongoDB & Mongoose**: Database and ODM
- **Socket.io**: Real-time communication
- **JWT**: Authentication
- **Nodemailer**: Email notifications
- **Twilio**: SMS notifications
- **Cloudinary**: Image storage
- **Winston**: Logging
- **Swagger**: API documentation

## API Routes

- `/api/auth`: Authentication routes (login, register, forgot password, etc.)
- `/api/flood-reports`: Flood reporting endpoints
- `/api/alerts`: Alert management
- `/api/emergency`: Emergency services
- `/api/predictions`: Flood prediction data
- `/api/users`: User management
- `/api/analytics`: Data analytics
- `/api/admin`: Admin-only operations
- `/api/weather`: Weather data
- `/api/notifications`: Notification management

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flood-management

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FROM_EMAIL=Flood Alert System <noreply@floodalert.com>

# SMS Configuration (Twilio)
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone_number

# External APIs
WEATHER_API_KEY=your_weather_api_key
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables as described above

3. Start the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## Notification System

The notification service supports three channels:

1. **In-app notifications**: Real-time via Socket.io
2. **Email notifications**: Using Nodemailer
3. **SMS notifications**: Using Twilio (for critical alerts)

Users can customize their notification preferences in their profile settings.

## Security Features

- JWT-based authentication
- Rate limiting to prevent brute force attacks
- Input sanitization to prevent XSS attacks
- Helmet for secure HTTP headers
- CORS protection
- Password hashing with bcrypt

## Testing

Run tests with:
```bash
npm test
```

## Folder Structure

```
├── config/             # Configuration files
├── middleware/         # Express middleware
│   ├── auth.js         # Authentication middleware
│   ├── errorHandler.js # Error handling
│   └── security.js     # Security middleware
├── models/             # Mongoose models
│   ├── Alert.js        # Alert model
│   ├── FloodReport.js  # Flood report model
│   ├── Notification.js # Notification model
│   └── User.js         # User model
├── routes/             # API routes
│   ├── admin.js        # Admin routes
│   ├── alerts.js       # Alert routes
│   ├── analytics.js    # Analytics routes
│   ├── auth.js         # Auth routes
│   ├── emergency.js    # Emergency routes
│   ├── floodReports.js # Flood report routes
│   ├── notifications.js# Notification routes
│   ├── predictions.js  # Prediction routes
│   ├── users.js        # User routes
│   └── weather.js      # Weather routes
├── services/           # Business logic
│   └── notificationService.js # Notification service
├── swagger/            # API documentation
├── utils/              # Utility functions
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
└── server.js          # Entry point
```