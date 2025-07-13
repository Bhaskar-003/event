# Event Management System

A comprehensive web application for managing educational institution events with role-based access control for administrators, department heads, and faculty members.

## Project Overview

This Event Management System allows educational institutions to efficiently organize, track, and report on academic and extracurricular events. The application supports multiple user roles with different levels of access and responsibilities.

### Key Features

- **User Authentication & Authorization**: Secure login system with role-based access (Admin, HOD, Faculty)
- **Event Management**: Create, view, edit, and delete events 
- **Event Assignment**: Assign events to specific faculty members
- **Report Generation**: Submit event reports with objectives and images
- **PDF Export**: Generate and download event reports as PDF documents
- **Dashboard Analytics**: View statistics and progress tracking for events and reports
- **Search & Filter**: Easily find events and reports with advanced filtering options

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- jsPDF for PDF generation
- CSS for styling

### Backend
- Node.js with Express
- MongoDB database
- RESTful API architecture
- File upload handling for images

## Installation & Setup

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Access the application at http://localhost:3000

## User Roles

### Administrator
- Manage all users and events
- System-wide access and control
- View analytics and reports

### Head of Department (HOD)
- Approve events for their department
- Assign events to faculty members
- View department-specific reports

### Faculty
- Submit event reports with details and images
- View and manage assigned events
- Generate PDF reports

## Project Structure

```
event/
├── backend/               # Node.js server
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files storage
│   └── server.js          # Server entry point
│
└── frontend/              # React client
    ├── public/            # Static files
    └── src/               # Application source
        ├── pages/         # React components for pages
        │   ├── AddEventForm.js
        │   ├── AdminDashboard.js
        │   ├── AssignEvent.js
        │   ├── EventDetail.js
        │   ├── EventList.js
        │   ├── FacultyDashboard.js
        │   ├── HODDashboard.js
        │   ├── LoginPage.js
        │   ├── ViewEvents.js
        │   └── WelcomePage.js
        ├── styles/        # CSS stylesheets
        └── App.js         # Main component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
