// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [view, setView] = useState('');
  const [action, setAction] = useState('');
  const [events, setEvents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [hods, setHods] = useState([]);
  const [eventReports, setEventReports] = useState([]);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', password: '', department: '' });
  const [newHod, setNewHod] = useState({ name: '', email: '', password: '', department: '' });
  const [editUser, setEditUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch data when view changes
  useEffect(() => {
    if (view === 'events') {
      fetch('http://localhost:5000/api/events').then(res => res.json()).then(setEvents);
      fetch('http://localhost:5000/api/reports').then(res => res.json()).then(setEventReports);
    } else if (view === 'faculty') {
      fetch('http://localhost:5000/api/users?role=faculty').then(res => res.json()).then(setFaculties);
    } else if (view === 'hods') {
      fetch('http://localhost:5000/api/users?role=hod').then(res => res.json()).then(setHods);
    }
    setSearchText('');
    setFilterDept('');
    setFilterStatus('');
  }, [view]);

  const handleAddUser = async (userData, role, setList, setForm) => {
    const res = await fetch('http://localhost:5000/api/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, role }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`${role} added!`);
      setForm({ name: '', email: '', password: '', department: '' });
      setList(prev => [...prev, data.user]);
      setAction('');
    } else {
      alert(data.message || 'Error adding user');
    }
  };

  const handleDeleteUser = async (id, role, setList) => {
    if (!window.confirm('Are you sure?')) return;
    const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('Deleted');
      setList(prev => prev.filter(u => u._id !== id));
    } else {
      alert(data.message || 'Error');
    }
  };

  const handleUpdateUser = async () => {
    const { _id, name, email, department } = editUser;
    const res = await fetch(`http://localhost:5000/api/users/${_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, department }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Updated');
      setEditUser(null);
      if (editUser.role === 'faculty') {
        setFaculties(prev => prev.map(u => u._id === _id ? data.user : u));
      } else {
        setHods(prev => prev.map(u => u._id === _id ? data.user : u));
      }
    } else {
      alert(data.message || 'Failed');
    }
  };

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
      alert('Error fetching reports');
    }
  };

  const handleDownloadPDF = (rep) => {
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
        doc.save(`${rep.title.replace(/\s+/g, '_')}_${rep._id}.pdf`);
      };
      img.src = rep.imageUrl;
    } else {
      doc.text('Submitted By:', 14, nextLine + 30);
      doc.text(`Name: ${rep.facultyName}`, 14, nextLine + 40);
      doc.text(`Department: ${rep.department}`, 14, nextLine + 50);
      doc.save(`${rep.title.replace(/\s+/g, '_')}_${rep._id}.pdf`);
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchText.toLowerCase()) ||
      ev.date.includes(searchText);
    const matchesDept = filterDept ? ev.department === filterDept : true;
    const hasReport = eventReports.some(rep => rep.eventId === ev._id);
    const matchesStatus =
      filterStatus === '' ||
      (filterStatus === 'submitted' && hasReport) ||
      (filterStatus === 'not-submitted' && !hasReport);
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredFaculty = faculties.filter(f =>
    (f.name.toLowerCase().includes(searchText.toLowerCase()) || f.email.toLowerCase().includes(searchText)) &&
    (filterDept ? f.department === filterDept : true)
  );

  const filteredHods = hods.filter(h =>
    (h.name.toLowerCase().includes(searchText.toLowerCase()) || h.email.toLowerCase().includes(searchText)) &&
    (filterDept ? h.department === filterDept : true)
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="user-info">
          <span>Admin</span>
          {view === 'faculty' && <button onClick={() => setAction('add-faculty')}>Add Faculty</button>}
          {view === 'hods' && <button onClick={() => setAction('add-hod')}>Add HOD</button>}
          <button onClick={() => window.location.href = '/login'}>Logout</button>
        </div>
      </header>

      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <ul>
            <li className={view === 'events' ? 'active' : ''} onClick={() => { setView('events'); setAction(''); }}>Events</li>
            <li className={view === 'faculty' ? 'active' : ''} onClick={() => { setView('faculty'); setAction(''); }}>Faculty</li>
            <li className={view === 'hods' ? 'active' : ''} onClick={() => { setView('hods'); setAction(''); }}>HODs</li>
          </ul>
        </aside>

        <main className="dashboard-content">
          {/* EVENTS VIEW */}
          {view === 'events' && (
            <div>
              <h3>All Events</h3>
              {filteredEvents.length > 0 && (
                <div className="report-stats">
                  {(() => {
                    const submittedCount = filteredEvents.filter(ev =>
                      eventReports.some(rep => rep.eventId === ev._id)
                    ).length;
                    const notSubmittedCount = filteredEvents.length - submittedCount;
                    return (
                      <p>
                        <strong>Submitted:</strong> {submittedCount} | 
                        <strong> Not Submitted:</strong> {notSubmittedCount}
                      </p>
                    );
                  })()}
                </div>
              )}
              <div className="event-filter-bar">
                <input placeholder="Search by title/date" value={searchText} onChange={e => setSearchText(e.target.value)} />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="">All Departments</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Reports</option>
                  <option value="submitted">Submitted</option>
                  <option value="not-submitted">Not Submitted</option>
                </select>
              </div>
              <p className="event-count">Number of Events: {filteredEvents.length}</p>
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
                  {filteredEvents.map((ev, i) => (
                    <tr key={i}>
                      <td>{ev.title}</td>
                      <td>{ev.department}</td>
                      <td>{ev.date}</td>
                      <td><button onClick={() => handleViewReport(ev._id)}>View Report</button></td>
                      <td>
                        {eventReports.some(rep => rep.eventId === ev._id) ? (
                          <span className="status submitted">Submitted</span>
                        ) : (
                          <span className="status not-submitted">Not Submitted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FACULTY VIEW */}
          {view === 'faculty' && action === '' && (
            <div>
              <h3>Faculty List</h3>
              <div className="event-filter-bar">
                <input placeholder="Search by name/email" value={searchText} onChange={e => setSearchText(e.target.value)} />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="">All Departments</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                </select>
              </div>
              <p className="event-count">Number of Faculty: {filteredFaculty.length}</p>
              <table className="event-table">
                <thead><tr><th>Name</th><th>Email</th><th>Dept</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredFaculty.map((f, i) => (
                    <tr key={i}>
                      <td>{f.name}</td>
                      <td>{f.email}</td>
                      <td>{f.department}</td>
                      <td>
                        <button className="edit-button" onClick={() => setEditUser(f)}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteUser(f._id, 'faculty', setFaculties)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* HOD VIEW */}
          {view === 'hods' && action === '' && (
            <div>
              <h3>HOD List</h3>
              <div className="event-filter-bar">
                <input placeholder="Search by name/email" value={searchText} onChange={e => setSearchText(e.target.value)} />
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="">All Departments</option>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                </select>
              </div>
              <p className="event-count">Number of HODs: {filteredHods.length}</p>
              <table className="event-table">
                <thead><tr><th>Name</th><th>Email</th><th>Dept</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredHods.map((h, i) => (
                    <tr key={i}>
                      <td>{h.name}</td>
                      <td>{h.email}</td>
                      <td>{h.department}</td>
                      <td>
                        <button className="edit-button" onClick={() => setEditUser(h)}>Edit</button>
                        <button className="delete-button" onClick={() => handleDeleteUser(h._id, 'hod', setHods)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add / Edit Forms */}
          {['add-faculty', 'add-hod'].includes(action) && (
            <div className="form-container">
              <h4>Add {action === 'add-faculty' ? 'Faculty' : 'HOD'}</h4>
              <input placeholder="Name" value={action === 'add-faculty' ? newFaculty.name : newHod.name}
                     onChange={e => action === 'add-faculty'
                       ? setNewFaculty({ ...newFaculty, name: e.target.value })
                       : setNewHod({ ...newHod, name: e.target.value })} />
              <input placeholder="Email" value={action === 'add-faculty' ? newFaculty.email : newHod.email}
                     onChange={e => action === 'add-faculty'
                       ? setNewFaculty({ ...newFaculty, email: e.target.value })
                       : setNewHod({ ...newHod, email: e.target.value })} />
              <input placeholder="Password" type="password"
                     value={action === 'add-faculty' ? newFaculty.password : newHod.password}
                     onChange={e => action === 'add-faculty'
                       ? setNewFaculty({ ...newFaculty, password: e.target.value })
                       : setNewHod({ ...newHod, password: e.target.value })} />
              <select value={action === 'add-faculty' ? newFaculty.department : newHod.department}
                      onChange={e => action === 'add-faculty'
                        ? setNewFaculty({ ...newFaculty, department: e.target.value })
                        : setNewHod({ ...newHod, department: e.target.value })}>
                <option value="">Select Dept</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
              </select>
              <button onClick={() => action === 'add-faculty'
                ? handleAddUser(newFaculty, 'faculty', setFaculties, setNewFaculty)
                : handleAddUser(newHod, 'hod', setHods, setNewHod)}>Add</button>
              <button onClick={() => setAction('')}>Cancel</button>
            </div>
          )}

          {/* EDIT USER MODAL */}
          {editUser && (
            <div className="modal-overlay">
              <div className="modal-content">
                <span className="close-btn" onClick={() => setEditUser(null)}>&times;</span>
                <h4>Edit {editUser.role === 'faculty' ? 'Faculty' : 'HOD'}</h4>
                <input
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  placeholder="Email"
                />
                <select
                  value={editUser.department}
                  onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                >
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                </select>
                <div className="modal-actions">
                  <button onClick={handleUpdateUser}>Update</button>
                  <button onClick={() => setEditUser(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;