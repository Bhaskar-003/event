// routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// 1. Add new event
router.post('/add', async (req, res) => {
  try {
    const { title, date, time, venue, createdBy, department } = req.body;
    const newEvent = new Event({ title, date, time, venue, createdBy, department });
    const savedEvent = await newEvent.save();
    res.status(201).json({ success: true, event: savedEvent });
  } catch (error) {
    console.error("❌ Error saving event:", error);
    res.status(500).json({ success: false, message: 'Failed to save event' });
  }
});

// 2. Fetch events with optional createdBy filter
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;

    const events = await Event.find(filter).populate('assignedTo', 'name email department');
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// 3. Assign or reassign event
router.post('/assign', async (req, res) => {
  const { eventId, facultyId } = req.body;
  console.log('📥 Assign API called with:', { eventId, facultyId });

  if (!eventId || !facultyId) {
    return res.status(400).json({ success: false, message: 'Missing eventId or facultyId' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Event not found:', eventId);
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      console.log('❌ Invalid faculty member:', faculty);
      return res.status(400).json({ success: false, message: 'Invalid faculty member' });
    }

    if (event.department !== faculty.department) {
      console.log(`❌ Department mismatch: ${event.department} vs ${faculty.department}`);
      return res.status(403).json({ success: false, message: 'Department mismatch' });
    }

    // Reassign
    event.assignedTo = facultyId;
    const updatedEvent = await event.save();

    console.log('✅ Event assigned/reassigned successfully');
    res.json({ success: true, message: 'Event assigned successfully', event: updatedEvent });
  } catch (error) {
    console.error('❌ Error assigning event:', error);
    res.status(500).json({ success: false, message: 'Server error during assignment' });
  }
});

// 4. Edit event
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log(`✅ Event ${id} updated`);
    res.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error(`❌ Error updating event ${id}:`, error);
    res.status(500).json({ success: false, message: 'Error updating event' });
  }
});

// 5. Delete event
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    console.log(`✅ Event ${id} deleted`);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting event ${id}:`, error);
    res.status(500).json({ success: false, message: 'Error deleting event' });
  }
});

// 6. Get all events assigned to a specific faculty
router.get('/assigned/:facultyId', async (req, res) => {
  const { facultyId } = req.params;

  try {
    const events = await Event.find({ assignedTo: facultyId });
    res.status(200).json(events);
  } catch (error) {
    console.error('❌ Error fetching assigned events:', error);
    res.status(500).json({ message: 'Error fetching assigned events' });
  }
});

module.exports = router;