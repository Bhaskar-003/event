import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EventDetail.css';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${id}`)
      .then((response) => setEvent(response.data))
      .catch((error) => console.error('Error fetching event:', error));
  }, [id]);

  if (!event) return <div className="loading">Loading event...</div>;

  return (
    <div className="event-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <div className="event-detail-card">
        <h2>{event.title}</h2>
        <p><strong>Department:</strong> {event.department}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Venue:</strong> {event.venue}</p>
        <p><strong>Description:</strong> {event.description || 'No description provided.'}</p>
      </div>
    </div>
  );
}

export default EventDetail;
