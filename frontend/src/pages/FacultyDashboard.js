import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/FacultyDashboard.css';

export default function FacultyDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('events');
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [objective, setObjective] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [reports, setReports] = useState([]);
  const [editReport, setEditReport] = useState(null);
  const [editedObjective, setEditedObjective] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const email = sessionStorage.getItem('email');
  const role = sessionStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (email && role === 'faculty') {
      fetch(`http://localhost:5000/api/users?role=faculty`)
        .then(res => res.json())
        .then(users => {
          const matchedUser = users.find(u => u.email === email);
          if (matchedUser) {
            setUser(matchedUser);
            fetchAssignedEvents(matchedUser._id);
          }
        });
    }
  }, [email, role]);

  // Always fetch reports when switching tabs or user changes
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/reports/faculty/${user._id}`)
        .then(res => res.json())
        .then(setReports);
    }
  }, [user, activeTab]);

  const fetchAssignedEvents = (facultyId) => {
    fetch(`http://localhost:5000/api/events/assigned/${facultyId}`)
      .then(res => res.json())
      .then(setAssignedEvents);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('eventId', selectedEvent._id);
    formData.append('facultyId', user._id);
    formData.append('title', selectedEvent.title);
    formData.append('date', selectedEvent.date);
    formData.append('time', selectedEvent.time);
    formData.append('venue', selectedEvent.venue);
    formData.append('department', user.department);
    formData.append('objective', objective);
    formData.append('image', image);

    const response = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('Report submitted!');
      setObjective('');
      setImage(null);
      setImagePreview(null);
      setSelectedEvent(null);
      const updatedReports = await fetch(`http://localhost:5000/api/reports/faculty/${user._id}`).then(res => res.json());
      setReports(updatedReports);
    } else {
      alert('Submission failed');
    }
  };

  const handleEditReportSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:5000/api/reports/${editReport._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective: editedObjective })
    });

    if (response.ok) {
      alert('Report updated!');
      setEditReport(null);
      setEditedObjective('');
      const updatedReports = await fetch(`http://localhost:5000/api/reports/faculty/${user._id}`).then(res => res.json());
      setReports(updatedReports);
    } else {
      alert('Update failed');
    }
  };

  const handleDeleteReport = async (id) => {
    const confirm = window.confirm('Delete this report?');
    if (!confirm) return;
    const res = await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Deleted');
      setReports(prev => prev.filter(r => r._id !== id));
    } else {
      alert('Delete failed');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Faculty Event Reports', 14, 15);
    const rows = reports.map((r, i) => [i + 1, r.title, r.date, r.time, r.venue, r.objective]);
    autoTable(doc, {
      head: [['#', 'Title', 'Date', 'Time', 'Venue', 'Objective']],
      body: rows,
      startY: 25
    });
    doc.save('faculty_reports.pdf');
  };

  const downloadSinglePDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Faculty Event Report', 75, 15);
    doc.setFontSize(12);
    doc.text(`Name of the Event: ${report.title}`, 14, 30);
    doc.text(`Date: ${report.date}`, 14, 40);
    doc.text(`Time: ${report.time}`, 14, 50);
    doc.text(`Venue: ${report.venue}`, 14, 60);
    doc.text(`Department: ${report.department}`, 14, 70);
    doc.text('Objective:', 14, 80);
    const splitObjective = doc.splitTextToSize(report.objective, 180);
    doc.text(splitObjective, 14, 90);
    const nextLine = 90 + splitObjective.length * 7;
    doc.text('It is helpful', 14, nextLine + 10);
    if (report.imageUrl) {
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
        doc.text(`Name: ${report.facultyName}`, textX, textY + 10);
        doc.text(`Department: ${report.department}`, textX, textY + 20);
        doc.save(`${report.title.replace(/\s+/g, '_')}_${report._id}.pdf`);
      };
      img.src = report.imageUrl;
    } else {
      doc.text('Submitted By:', 14, nextLine + 30);
      doc.text(`Name: ${report.facultyName}`, 14, nextLine + 40);
      doc.text(`Department: ${report.department}`, 14, nextLine + 50);
      doc.save(`${report.title.replace(/\s+/g, '_')}_${report._id}.pdf`);
    }
  };

  const viewSinglePDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Faculty Event Report', 75, 15);
    doc.setFontSize(12);
    doc.text(`Name of the Event: ${report.title}`, 14, 30);
    doc.text(`Date: ${report.date}`, 14, 40);
    doc.text(`Time: ${report.time}`, 14, 50);
    doc.text(`Venue: ${report.venue}`, 14, 60);
    doc.text(`Department: ${report.department}`, 14, 70);
    doc.text('Objective:', 14, 80);
    const splitObjective = doc.splitTextToSize(report.objective, 180);
    doc.text(splitObjective, 14, 90);
    const nextLine = 90 + splitObjective.length * 7;
    doc.text('It is helpful', 14, nextLine + 10);
    if (report.imageUrl) {
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
        doc.text(`Name: ${report.facultyName}`, textX, textY + 10);
        doc.text(`Department: ${report.department}`, textX, textY + 20);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      };
      img.src = report.imageUrl;
    } else {
      doc.text('Submitted By:', 14, nextLine + 30);
      doc.text(`Name: ${report.facultyName}`, 14, nextLine + 40);
      doc.text(`Department: ${report.department}`, 14, nextLine + 50);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.objective.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        let filteredEvents = [...assignedEvents];

        if (searchText) {
          const query = searchText.toLowerCase();
          filteredEvents = filteredEvents.filter(ev =>
            ev.title.toLowerCase().includes(query) || ev.date.toLowerCase().includes(query)
          );
        }

        if (filterDept) {
          filteredEvents = filteredEvents.filter(ev => ev.department === filterDept);
        }

        if (filterStatus === 'submitted') {
          filteredEvents = filteredEvents.filter(ev => reports.some(r => r.eventId === ev._id));
        } else if (filterStatus === 'not-submitted') {
          filteredEvents = filteredEvents.filter(ev => !reports.some(r => r.eventId === ev._id));
        }

        const submittedCount = filteredEvents.filter(ev => reports.some(r => r.eventId === ev._id)).length;
        const notSubmittedCount = filteredEvents.length - submittedCount;

        return (
          <div>
            <h3>Your Assigned Events</h3>

            {/* Stats Section */}
            {filteredEvents.length > 0 && (
              <div className="report-stats">
                <p>
                  <strong>Submitted:</strong> {submittedCount} | 
                  <strong> Not Submitted:</strong> {notSubmittedCount}
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="event-filter-bar" style={{ marginBottom: '15px' }}>
              <input
                placeholder="Search by title/date"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ padding: '8px', width: '200px', marginRight: '10px' }}
              />
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ padding: '8px', marginRight: '10px' }}>
                <option value="">All Departments</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px' }}>
                <option value="">All Reports</option>
                <option value="submitted">Submitted</option>
                <option value="not-submitted">Not Submitted</option>
              </select>
            </div>

            {/* Count Display */}
            <p className="event-count">Number of Events: {filteredEvents.length}</p>

            {/* Table */}
            <table className="event-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Dept</th>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const reported = reports.some(r => r.eventId === ev._id);
                  return (
                    <tr key={ev._id}>
                      <td>{ev.title}</td>
                      <td>{ev.department}</td>
                      <td>{ev.date}</td>
                      <td><button onClick={() => alert('View Report for ' + ev.title)}>View Report</button></td>
                      <td>
                        {reported ? (
                          <span className="status submitted">Submitted</span>
                        ) : (
                          <span className="status not-submitted">Not Submitted</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'generateReport':
        return (
          <div>
            <h3>Generate Report</h3>
            <ul className="event-list">
              {assignedEvents.map(ev => {
                const already = reports.some(r => r.eventId === ev._id);
                return (
                  <li key={ev._id} style={{ marginBottom: '15px', backgroundColor: already ? '#e0ffe0' : 'transparent', padding: '10px', border: '1px solid #ccc' }}>
                    <p><strong>{ev.title}</strong> – {ev.date} at {ev.time} – {ev.venue}</p>
                    {already ? (
                      <p style={{ color: 'green' }}>Report already submitted.</p>
                    ) : (
                      <button onClick={() => setSelectedEvent(ev)}>Generate Report</button>
                    )}
                  </li>
                );
              })}
            </ul>
            {selectedEvent && !reports.some(r => r.eventId === selectedEvent._id) && (
              <form onSubmit={handleReportSubmit} className="generate-report-form">
                <h4>Submit Report for: {selectedEvent.title}</h4>
                <p><strong>Date:</strong> {selectedEvent.date}</p>
                <p><strong>Time:</strong> {selectedEvent.time}</p>
                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>Department:</strong> {user.department}</p>
                <label>Objective:</label><br />
                <textarea value={objective} onChange={e => setObjective(e.target.value)} required /><br />
                <label>Upload Image:</label><br />
                <input type="file" accept="image/*" onChange={e => {
                  setImage(e.target.files[0]);
                  setImagePreview(URL.createObjectURL(e.target.files[0]));
                }} required /><br />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                )}
                <button type="submit">Submit</button>
                <button type="button" onClick={() => {
                  setSelectedEvent(null);
                  setImage(null);
                  setImagePreview(null);
                  setObjective('');
                }}>Cancel</button>
              </form>
            )}
          </div>
        );

      case 'viewReport':
        return (
          <div>
            <h3>Submitted Reports</h3>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ marginBottom: '10px', padding: '5px', width: '300px' }}
            />
            <button onClick={downloadPDF}>Download All PDF</button>
            {filteredReports.length > 0 ? (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th><th>Date</th><th>Time</th><th>Venue</th><th>Objective</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(r => (
                      <tr key={r._id}>
                        <td>{r.title}</td>
                        <td>{r.date}</td>
                        <td>{r.time}</td>
                        <td>{r.venue}</td>
                        <td>{r.objective}</td>
                        <td>
                          <button onClick={() => downloadSinglePDF(r)}>Download</button>
                          <button onClick={() => viewSinglePDF(r)}>View</button>
                          <button onClick={() => {
                            setEditReport(r);
                            setEditedObjective(r.objective);
                          }}>Edit</button>
                          <button onClick={() => handleDeleteReport(r._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {editReport && (
                  <div className="edit-form">
                    <h4>Edit Report</h4>
                    <form onSubmit={handleEditReportSubmit}>
                      <textarea
                        value={editedObjective}
                        onChange={e => setEditedObjective(e.target.value)}
                        required
                      /><br />
                      <button type="submit">Update</button>
                      <button type="button" onClick={() => setEditReport(null)}>Cancel</button>
                    </form>
                  </div>
                )}
              </>
            ) : <p>No reports available.</p>}
          </div>
        );

      default:
        return <p>Select a tab from the sidebar.</p>;
    }
  };

  if (!email || role !== 'faculty') return <p>Unauthorized. Please login as Faculty.</p>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Faculty Dashboard</h2>
        <div className="user-info">
          {user && (
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              Welcome, {user.name} ({user.department})
            </span>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <ul>
            <li onClick={() => setActiveTab('events')} className={activeTab === 'events' ? 'active' : ''}>Events</li>
            <li onClick={() => setActiveTab('generateReport')} className={activeTab === 'generateReport' ? 'active' : ''}>Generate Report</li>
            <li onClick={() => setActiveTab('viewReport')} className={activeTab === 'viewReport' ? 'active' : ''}>View Report</li>
          </ul>
        </aside>
        <section className="dashboard-content">
          {renderContent()}
        </section>
      </div>
    </div>
  );
}