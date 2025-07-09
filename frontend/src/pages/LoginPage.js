import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Login successful!');
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('role', role);

        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'faculty') navigate('/faculty-dashboard');
        else if (role === 'hod') navigate('/hod-dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  return (
    <>
      <header className="login-header">
        <div className="header-title">Department Event Management System</div>
      </header>

      <div className="login-container">
        <h2>Login Page</h2>
        <form onSubmit={handleLogin}>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
          </select>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
