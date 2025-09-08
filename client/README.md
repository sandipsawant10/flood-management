# Flood Disaster Management System - Frontend

## Overview
This is the frontend client for the Flood Disaster Management System. It provides a user-friendly interface for flood reporting, alert management, emergency response, and data visualization.

## Features

- **User Authentication**: Secure login, registration, and password reset
- **Dashboard**: Overview of flood situations, alerts, and reports
- **Flood Reporting**: Submit and track flood reports with location data and images
- **Alert Management**: View and manage flood alerts
- **Emergency Services**: Access to emergency contacts, SOS functionality, and evacuation information
- **Interactive Maps**: Visualize flood data, reports, and risk areas
- **Analytics**: Data visualization of flood trends and statistics
- **Notifications**: Real-time notifications for alerts and updates
- **User Profile**: Manage personal information and notification preferences
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18**: UI library
- **React Router v7**: Navigation
- **Zustand**: State management
- **TanStack React Query**: Data fetching and caching
- **Tailwind CSS**: Styling
- **Chart.js & Recharts**: Data visualization
- **React Leaflet**: Maps
- **Socket.io Client**: Real-time communication
- **React Hook Form**: Form handling and validation
- **Vite**: Build tool

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the client directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_MAPS_API_KEY=your_maps_api_key (if applicable)
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
├── public/             # Static files
├── src/                # Source files
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   │   ├── Alerts/     # Alert-related components
│   │   ├── Auth/       # Authentication components
│   │   ├── Common/     # Common UI components
│   │   ├── Layout/     # Layout components
│   │   ├── Maps/       # Map components
│   │   ├── Notifications/ # Notification components
│   │   └── Reports/    # Report components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── Alerts/     # Alert pages
│   │   ├── Analytics/  # Analytics pages
│   │   ├── Auth/       # Authentication pages
│   │   ├── Dashboard/  # Dashboard pages
│   │   ├── Emergency/  # Emergency pages
│   │   ├── Map/        # Map pages
│   │   ├── Notifications/ # Notification pages
│   │   ├── Profile/    # Profile pages
│   │   └── Reports/    # Report pages
│   ├── services/       # API service functions
│   ├── store/          # State management
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## Key Components

### Authentication
- Login, Register, and Forgot Password pages
- Protected routes for authenticated users
- JWT token management

### Dashboard
- Overview of flood situations
- Recent alerts and reports
- Quick access to key features

### Flood Reporting
- Form for submitting flood reports
- Image upload capability
- Location selection via map
- Report status tracking

### Maps
- Interactive maps showing flood data
- Layers for different data types
- Location selection for reports

### Notifications
- Real-time notifications via WebSockets
- Notification center for viewing all notifications
- Customizable notification preferences

## State Management

The application uses Zustand for global state management, particularly for:
- User authentication state
- UI theme and preferences
- Global application state

React Query is used for server state management, handling:
- Data fetching
- Caching
- Synchronization
- Updates

## Responsive Design

The application is designed to work on various screen sizes:
- Desktop: Full-featured interface
- Tablet: Adapted layout with all features
- Mobile: Streamlined interface with focus on critical features

## PWA Support

The application includes Progressive Web App features:
- Offline capability
- Installation on home screen
- Push notifications (where supported)

## Development Guidelines

- Follow the component structure for new features
- Use React Query for data fetching
- Implement responsive design for all components
- Write clean, maintainable code with proper comments
- Follow the established styling patterns with Tailwind CSS
