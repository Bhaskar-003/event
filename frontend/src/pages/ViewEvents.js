import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ViewEvents.css';

function ViewEvents() {
  const [events, setEvents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get('http://localhost:5000/api/events')
      .then((response) => {
        setEvents(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
        setIsLoading(false);
      });
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isEventUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  return (
    <>
      <header className="top-nav">
        <div className="site-name">Department Event Management</div>
        <div className="nav-buttons">
          <button className="view-btn" onClick={() => window.location.href = '/'}>← Back</button>
        </div>
      </header>

      <div className="view-events-container">
        <h2>Browse All Events</h2>

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
            <option value="All">All Events</option>
            <option value="Upcoming">Upcoming Events</option>
            <option value="Past">Past Events</option>
          </select>
        </div>

        {/* Events Counter */}
        <div className="event-counter">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : (
          /* Events Display */
          <div className="cards-container">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className={`event-card ${expandedId === event._id ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(event._id)}
                >
                  {isEventUpcoming(event.date) && <div className="upcoming-badge">Upcoming</div>}
                  <h3>{event.title}</h3>
                  <p><strong>Department:</strong> {event.department}</p>
                  <p><strong>Date:</strong> {formatDate(event.date)}</p>
                  
                  {expandedId === event._id && (
                    <div className="event-details">
                      <p><strong>Time:</strong> {event.time}</p>
                      <p><strong>Venue:</strong> {event.venue}</p>
                      {event.description && (
                        <p><strong>Description:</strong> {event.description}</p>
                      )}
                      <div className="card-footer">
                        <span className="expand-hint">Click to collapse</span>
                      </div>
                    </div>
                  )}
                  
                  {expandedId !== event._id && (
                    <div className="card-footer">
                      <span className="expand-hint">Click for details</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No matching events found. Try adjusting your filters.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ViewEvents;
