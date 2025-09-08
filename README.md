# Flood Disaster Management System

## Overview
The Flood Disaster Management System is a comprehensive web application designed to help communities prepare for, respond to, and recover from flood disasters. The system provides real-time flood alerts, reporting capabilities, emergency response coordination, and data analytics to improve disaster management efforts.

## Features

### User Management
- User registration and authentication
- Profile management
- Password reset functionality
- Role-based access control (admin, regular users)

### Flood Reporting
- Submit flood reports with location data
- Upload images of flood situations
- Track report status and updates
- View historical reports

### Alert System
- Real-time flood alerts based on severity levels
- Customizable notification preferences
- Multi-channel notifications (in-app, email, SMS)
- Geographic targeting of alerts

### Emergency Response
- Emergency contact information
- SOS functionality for immediate assistance
- Emergency resource locator
- Evacuation routes and safe zones

### Maps and Visualization
- Interactive flood maps using Leaflet
- Real-time flood data visualization
- Historical flood data overlays
- Risk assessment visualization

### Analytics and Predictions
- Flood trend analysis
- Predictive modeling for flood risks
- Data visualization with charts and graphs
- Downloadable reports

### Notifications
- Real-time notifications via WebSockets
- Email notifications for critical alerts
- SMS notifications for emergency situations
- Customizable notification preferences

### Admin Dashboard
- User management
- System-wide analytics
- Alert management
- Content moderation

## Tech Stack

### Frontend
- React 18
- React Router v7
- Zustand for state management
- TanStack React Query for data fetching
- Tailwind CSS for styling
- Chart.js and Recharts for data visualization
- React Leaflet for maps
- Socket.io client for real-time communication

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time communication
- Nodemailer for email notifications
- Twilio for SMS notifications
- Winston for logging
- Swagger for API documentation

### DevOps & Tools
- Vite for frontend build
- Nodemon for development
- Jest for testing
- ESLint for code quality
- Environment-based configuration

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # Reusable components
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       ├── store/          # State management
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── swagger/            # API documentation
│   └── utils/              # Utility functions
└── shared/                 # Shared code between client and server
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/flood-disaster-management.git
   cd flood-disaster-management
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Configure server environment variables
   - Create a `.env` file in the server directory based on `.env.example`
   - Set up your MongoDB connection string, JWT secret, email service credentials, etc.

4. Install client dependencies
   ```bash
   cd ../client
   npm install
   ```

5. Configure client environment variables
   - Create a `.env` file in the client directory with the necessary variables

### Running the Application

1. Start the server
   ```bash
   cd server
   npm run dev
   ```

2. Start the client
   ```bash
   cd client
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## Notification System

The system supports multiple notification channels:

1. **In-app notifications**: Real-time notifications via WebSockets
2. **Email notifications**: Sent via Nodemailer for alerts and account-related activities
3. **SMS notifications**: Sent via Twilio for critical and emergency alerts

Users can customize their notification preferences in their profile settings.

## Deployment

### Frontend
1. Build the client
   ```bash
   cd client
   npm run build
   ```
2. Deploy the contents of the `dist` directory to your web server or hosting service

### Backend
1. Set up production environment variables
2. Deploy the server code to your hosting service
3. Configure a process manager like PM2 to keep the server running

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Leaflet](https://leafletjs.com/)
- [Chart.js](https://www.chartjs.org/)