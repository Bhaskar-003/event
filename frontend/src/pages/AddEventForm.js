import React, { useState } from 'react';
import '../styles/AddEventForm.css'; // ⬅️ Import the CSS file

function AddEventForm({ onEventAdded, createdBy, department }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    objective: '',
    image: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submission = { ...formData, createdBy, department }; // ✅ Include department
    const res = await fetch('http://localhost:5000/api/events/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });

    const data = await res.json();
    if (data.success) {
      alert('Event added successfully!');
      setFormData({
        title: '',
        date: '',
        time: '',
        venue: ''
      });
      onEventAdded(data.event);
    } else {
      alert('Failed to add event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-event-form">
      <h2>Add Event</h2>
      <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
      <input type="time" name="time" value={formData.time} onChange={handleChange} required />
      <input name="venue" value={formData.venue} onChange={handleChange} placeholder="Venue" required />

      <button type="submit">Save Event</button>
    </form>
  );
}

export default AddEventForm;
