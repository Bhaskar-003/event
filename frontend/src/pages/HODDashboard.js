import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf'; // Added for PDF generation
import AddEventForm from './AddEventForm';
import '../styles/HODDashboard.css';

function HODDashboard() {
  const [view, setView] = useState('events');
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userData, setUserData] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyMap, setSelectedFacultyMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [assignFilter, setAssignFilter] = useState('all'); // New state for assign filter
  const [eventReports, setEventReports] = useState([]); // New state to store reports
  const email = sessionStorage.getItem('email');
  const role = sessionStorage.getItem('role');

  const fetchFaculty = async dept => {
    try {
      const res = await fetch(`http://localhost:5000/api/users?role=faculty`);
      const data = await res.json();
      setFacultyList(data.filter(f => f.department === dept));
    } catch {
      console.error('Error fetching faculty');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users?role=hod`);
        const users = await res.json();
        const currentUser = users.find(u => u.email === email);
        setUserData(currentUser);
        if (currentUser?.department) {
          fetchFaculty(currentUser.department);
        }
      } catch {
        console.error('Failed to fetch user info');
      }
    };
    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events?createdBy=${email}`);
        setEvents(await res.json());
      } catch {
        console.error('Failed to fetch events');
      }
    };
    const fetchReports = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reports`);
        setEventReports(await res.json());
      } catch {
        console.error('Failed to fetch reports');
      }
    };

    fetchUser();

    if (view === 'report') {
      fetchEvents();
      fetchReports();
    } else {
      fetchEvents(); // Keep old behavior
    }

  }, [email, view]); // Now depends on `view`

  const handleAddEvent = newEvent => {
    setEvents(prev => [...prev, newEvent]);
  };

  const handleFacultyChange = (eventId, facultyId) => {
    setSelectedFacultyMap(prev => ({ ...prev, [eventId]: facultyId }));
  };

  const handleAssign = async (eventId) => {
    const facultyId = selectedFacultyMap[eventId];
    if (!facultyId) {
      return alert('Please select a faculty before assigning.');
    }
    try {
      const res = await fetch('http://localhost:5000/api/events/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, facultyId }),
      });
      const data = await res.json();
      alert(data.success ? 'Event assigned!' : 'Failed: ' + data.message);
      const updated = await fetch(`http://localhost:5000/api/events?createdBy=${email}`);
      setEvents(await updated.json());
    } catch {
      alert('Server error, try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.filter(e => e._id !== id));
        alert('Event deleted successfully');
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting event');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${editingEvent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.map(e => e._id === data.event._id ? data.event : e));
        setEditingEvent(null);
        alert('Event updated successfully');
      } else {
        alert('Failed to update event');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating event');
    }
  };

  // Filter logic
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.date.includes(searchQuery)
  );

  const filteredFaculty = facultyList.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Assign Events with additional filter
  const filteredAssignEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.assignedTo?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    if (assignFilter === 'assigned') {
      return matchesSearch && event.assignedTo;
    } else if (assignFilter === 'unassigned') {
      return matchesSearch && !event.assignedTo;
    }
    return matchesSearch;
  });

  // REPORT TAB LOGIC
  const filteredReportEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.assignedTo?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // --- NEW FUNCTION: Generate and Preview PDF ---
  const handleViewReport = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reports/event/${eventId}`);
      const json = await res.json();
      if (res.ok && json.length > 0) {
        const rep = json[0];
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Faculty Event Report', 75, 15);
        doc.setFontSize(12);
        doc.text(`Name of the Event: ${rep.title}`, 14, 30);
        doc.text(`Date: ${rep.date}`, 14, 40);
        doc.text(`Time: ${rep.time}`, 14, 50);
        doc.text(`Venue: ${rep.venue}`, 14, 60);
        doc.text(`Department: ${rep.department}`, 14, 70);
        doc.text('Objective:', 14, 80);
        const splitObjective = doc.splitTextToSize(rep.objective, 180);
        doc.text(splitObjective, 14, 90);
        const nextLine = 90 + splitObjective.length * 7;
        doc.text('It is helpful', 14, nextLine + 10);

        if (rep.imageUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const imgX = 14;
            const imgY = nextLine + 25;
            const imgWidth = 60;
            const imgHeight = 50;
            doc.text("Event Image:", imgX, imgY - 5);
            doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);

            const textX = imgX + imgWidth + 20;
            const textY = imgY + 10;
            doc.text('Submitted By:', textX, textY);
            doc.text(`Name: ${rep.facultyName}`, textX, textY + 10);
            doc.text(`Department: ${rep.department}`, textX, textY + 20);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
          };
          img.src = rep.imageUrl;
        } else {
          doc.text('Submitted By:', 14, nextLine + 30);
          doc.text(`Name: ${rep.facultyName}`, 14, nextLine + 40);
          doc.text(`Department: ${rep.department}`, 14, nextLine + 50);

          const pdfBlob = doc.output('blob');
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        }
      } else {
        alert(json.message || 'No reports found');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching report');
    }
  };

  if (!email || role !== 'hod') return <p>Unauthorized. Please login as HOD.</p>;

  return (
    <div className="hod-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {userData?.name} ({userData?.department})</h2>
        <div className="user-info">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          {view === 'events' && (
            <button className="add-event-toggle" onClick={() => setShowForm(true)}>+ Add Event</button>
          )}
        </div>
      </div>
      <div className="dashboard-body">
        {/* Sidebar */}
        <div className="sidebar">
          <h3>HOD Panel</h3>
          <ul>
            <li className={view === 'events' ? 'active' : ''}>
              <button onClick={() => setView('events')}>Events</button>
            </li>
            <li className={view === 'faculty' ? 'active' : ''}>
              <button onClick={() => setView('faculty')}>Faculty</button>
            </li>
            <li className={view === 'assign' ? 'active' : ''}>
              <button onClick={() => setView('assign')}>Assign</button>
            </li>
            <li className={view === 'report' ? 'active' : ''}>
              <button onClick={() => setView('report')}>Report</button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          {/* EVENTS TAB */}
          {view === 'events' && (
            <>
              <h3>Events</h3>
              <p><strong>Total number of Events:</strong> {filteredEvents.length} of {events.length}</p>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by title or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredEvents.length > 0 ? (
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Venue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{event.date}</td>
                        <td>{event.time}</td>
                        <td>{event.venue}</td>
                        <td>
                          <button className="edit-button" onClick={() => setEditingEvent(event)}>Edit</button>
                          <button className="delete-button" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No matching events found.</p>
              )}

              {/* Modal - Add Event */}
              {showForm && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <button className="close-button" onClick={() => setShowForm(false)}>✖</button>
                    <AddEventForm
                      onEventAdded={(event) => {
                        handleAddEvent(event);
                        setShowForm(false);
                      }}
                      createdBy={email}
                      department={userData?.department}
                    />
                  </div>
                </div>
              )}

              {/* Modal - Edit Event */}
              {editingEvent && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <button className="close-button" onClick={() => setEditingEvent(null)}>✖</button>
                    <h3>Edit Event</h3>
                    <input
                      placeholder="Title"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                    <input
                      type="date"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    />
                    <input
                      type="time"
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    />
                    <input
                      placeholder="Venue"
                      value={editingEvent.venue}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    />
                    <button onClick={handleUpdateEvent}>Update Event</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* FACULTY TAB */}
          {view === 'faculty' && (
            <>
              <h3>Faculty in {userData?.department} Department</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search faculty by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredFaculty.length > 0 ? (
                <>
                  <p><strong>Total Faculty:</strong> {filteredFaculty.length}</p>
                  <table className="event-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFaculty.map((f) => (
                        <tr key={f._id}>
                          <td>{f.name}</td>
                          <td>{f.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No matching faculty found.</p>
              )}
            </>
          )}

          {/* ASSIGN TAB */}
          {view === 'assign' && (
            <>
              <h3>Assign Events to Faculty</h3>
              {/* Filter Dropdown */}
              <div className="filter-bar">
                <label htmlFor="assign-filter">Show:</label>
                <select
                  id="assign-filter"
                  value={assignFilter}
                  onChange={(e) => setAssignFilter(e.target.value)}
                >
                  <option value="all">All Events</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>
              {/* Search Bar */}
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by event title or faculty name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Count Summary */}
              <div className="event-count-summary">
                <p>
                  <strong>Total:</strong> {events.length} |
                  <strong> Assigned:</strong> {events.filter(e => e.assignedTo).length} |
                  <strong> Unassigned:</strong> {events.filter(e => !e.assignedTo).length}
                </p>
              </div>
              {/* Table */}
              {filteredAssignEvents.length > 0 ? (
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Venue</th>
                      <th>Assigned Faculty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignEvents.map((event) => (
                      <tr key={event._id}>
                        <td>{event.title}</td>
                        <td>{event.date}</td>
                        <td>{event.time}</td>
                        <td>{event.venue}</td>
                        <td>{event.assignedTo ? event.assignedTo.name : 'Unassigned'}</td>
                        <td>
                          <select
                            onChange={(e) => handleFacultyChange(event._id, e.target.value)}
                            value={selectedFacultyMap[event._id] || (event.assignedTo?._id || '')}
                          >
                            <option value="">-- Select Faculty --</option>
                            {facultyList.map(f => (
                              <option key={f._id} value={f._id}>{f.name}</option>
                            ))}
                          </select>
                          <button onClick={() => handleAssign(event._id)}>
                            {event.assignedTo ? 'Reassign' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No matching events found.</p>
              )}
            </>
          )}

          {/* REPORT TAB */}
          {view === 'report' && (
            <>
              <h3>Event Reports</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by event title or faculty name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredReportEvents.length > 0 ? (
                <>
                  <p><strong>Total Events:</strong> {filteredReportEvents.length}</p>
                  <table className="event-table">
                    <thead>
                      <tr>
                        <th>Name of the Event</th>
                        <th>Assigned Faculty</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReportEvents.map((event) => {
                        const hasReport = eventReports.some(rep => rep.eventId === event._id);
                        return (
                          <tr key={event._id}>
                            <td>{event.title}</td>
                            <td>{event.assignedTo ? event.assignedTo.name : 'Unassigned'}</td>
                            <td>
                              <span className={`status ${hasReport ? 'submitted' : 'not-submitted'}`}>
                                {hasReport ? 'Submitted' : 'Not Submitted'}
                              </span>
                            </td>
                            <td>
                              <button onClick={() => handleViewReport(event._id)}>View Report</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No events found for report.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HODDashboard;