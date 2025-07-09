import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ViewEvents.css';

function ViewEvents() {
  const [events, setEvents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then((response) => setEvents(response.data))
      .catch((error) => console.error('Error fetching events:', error));
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const departments = ['All', ...new Set(events.map(event => event.department))];
  const today = new Date();

  const filteredEvents = events.filter((event) => {
    const matchesDept = selectedDept === 'All' || event.department === selectedDept;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.department.toLowerCase().includes(searchQuery.toLowerCase());

    const eventDate = new Date(event.date);
    let matchesTime = true;

    if (selectedTimeFilter === 'Upcoming') {
      matchesTime = eventDate >= today;
    } else if (selectedTimeFilter === 'Past') {
      matchesTime = eventDate < today;
    }

    return matchesDept && matchesSearch && matchesTime;
  });

  return (
    <>
      <header className="top-nav">
        <div className="site-name">Department Event Management</div>
        <div className="nav-buttons">
          <button className="view-btn" onClick={() => window.location.href = '/'}>← Back</button>
        </div>
      </header>

      <div className="view-events-container">
        <h2>All Events</h2>

        {/* Search and Combined Filter Bar */}
        <div className="controls-bar">
          <input
            type="text"
            className="search-box"
            placeholder="Search by title or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Past">Past</option>
          </select>
        </div>

        {/* Events Display */}
        <div className="cards-container">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className={`event-card ${expandedId === event._id ? 'expanded' : ''}`}
                onClick={() => toggleExpand(event._id)}
              >
                <h3>{event.title}</h3>
                <p><strong>Department:</strong> {event.department}</p>

                {expandedId === event._id && (
                  <div className="event-details">
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Time:</strong> {event.time}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No matching events found.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewEvents;
