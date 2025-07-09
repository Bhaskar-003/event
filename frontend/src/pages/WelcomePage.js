// src/pages/WelcomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleViewEvents = () => {
    navigate('/view-events'); // Ensure this matches your route in App.js
  };

  return (
    <div className="welcome-page">
      <header className="top-nav">
        <div className="site-name">Department Event Management</div>
        <div className="nav-buttons">
          <button className="view-btn" onClick={handleViewEvents}>View Events</button>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
      </header>

      <main className="welcome-content">
        <div className="content-box">
          <h1>Welcome to Department Event Management System</h1>
          <p>
            Manage, organize, and view events seamlessly across all departments.
          </p>
          
        </div>
      </main>
    </div>
  );
}

export default WelcomePage;
