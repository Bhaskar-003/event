const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  eventId: String,
  facultyId: String,
  title: String,
  date: String,
  time: String,
  venue: String,
  department: String,
  objective: String,
  imagePath: String,
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
