import React, { useState } from 'react';

function AssignEvent({ events, facultyList, onAssign }) {
  const [eid, setEid] = useState('');
  const [fid, setFid] = useState('');

  const doAssign = () => {
    if (!eid || !fid) return alert('Please select both event and faculty');
    onAssign(eid, fid);
    setEid('');
    setFid('');
  };

  return (
    <div className="assign-event">
      <h3>Assign Event to Faculty</h3>

      <select value={eid} onChange={(e) => setEid(e.target.value)}>
        <option value="">-- Select Event --</option>
        {events.map(ev => (
          <option key={ev._id} value={ev._id}>
            {ev.title} ({ev.date})
          </option>
        ))}
      </select>

      <select value={fid} onChange={(e) => setFid(e.target.value)}>
        <option value="">-- Select Faculty --</option>
        {facultyList.map(f => (
          <option key={f._id} value={f._id}>
            {f.name} - {f.email}
          </option>
        ))}
      </select>

      <button onClick={doAssign}>Assign</button>
    </div>
  );
}

export default AssignEvent;
