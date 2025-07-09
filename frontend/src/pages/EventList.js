import React from 'react';

function EventList({ events }) {
  return (
    <div>
      <h2>All Events</h2>
      {events.map((event, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px' }}>
          <h3>{event.title}</h3>
          <p><strong>Date:</strong> {event.date} | <strong>Time:</strong> {event.time}</p>
          <p><strong>Venue:</strong> {event.venue}</p>

        </div>
      ))}
    </div>
  );
}

export default EventList;
