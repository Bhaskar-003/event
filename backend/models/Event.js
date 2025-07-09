const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  venue: String,
  createdBy: String, // email of HOD
  department: String, // department of event
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // initially no assignment
  }
});

module.exports = mongoose.model('Event', EventSchema);
