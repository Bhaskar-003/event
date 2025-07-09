import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import HODDashboard from './pages/HODDashboard';
import LoginPage from './pages/LoginPage';
import ViewEvents from './pages/ViewEvents';
import ViewEventDetails from './pages/EventDetail'; // New page we'll create next

// ...




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/faculty-dashboard" element={<FacultyDashboard />} />
<Route path="/hod-dashboard" element={<HODDashboard />} />
<Route path="/view-events" element={<ViewEvents />} />
<Route path="/event/:id" element={<ViewEventDetails />} />

        {/* Add more routes here later */}
      </Routes>
    </Router>
  );
}

export default App;
