const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/eventDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const User = require('./models/User');
const Event = require('./models/Event');
const Report = require('./models/Report');

const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ====================== USER ROUTES ======================

app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, password, role });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login error' });
  }
});

app.post('/api/users/add', async (req, res) => {
  const { name, email, password, department, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: 'User already exists' });

    const newUser = new User({ name, email, password, department, role });
    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving user' });
  }
});

app.get('/api/users', async (req, res) => {
  const { role } = req.query;
  try {
    const users = await User.find({ role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email, department: req.body.department },
      { new: true }
    );
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// ====================== REPORT ROUTES ======================

app.post('/api/reports', upload.single('image'), async (req, res) => {
  try {
    const existingReport = await Report.findOne({
      eventId: req.body.eventId,
      facultyId: req.body.facultyId
    });

    if (existingReport) {
      return res.status(400).json({ success: false, message: 'Report already exists for this event.' });
    }

    const imagePath = req.file?.path?.replace(/\\/g, '/');

    const report = new Report({
      eventId: req.body.eventId,
      facultyId: req.body.facultyId,
      title: req.body.title,
      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,
      department: req.body.department,
      objective: req.body.objective,
      imagePath
    });

    await report.save();
    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ success: false, message: 'Error saving report' });
  }
});

app.get('/api/reports/faculty/:id', async (req, res) => {
  try {
    const reports = await Report.find({ facultyId: req.params.id });

    const faculty = await User.findById(req.params.id);

    const reportsWithDetails = reports.map(report => {
      const imageUrl = report.imagePath
        ? `${req.protocol}://${req.get('host')}/${report.imagePath.replace(/\\/g, '/')}`
        : null;

      return {
        ...report.toObject(),
        facultyName: faculty?.name || 'N/A',
        department: faculty?.department || 'N/A',
        imageUrl
      };
    });

    res.json(reportsWithDetails);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// ✅ NEW: Get all reports for a specific Event ID (used in AdminDashboard)
app.get('/api/reports/event/:id', async (req, res) => {
  try {
    const reports = await Report.find({ eventId: req.params.id });

    const enrichedReports = await Promise.all(reports.map(async (report) => {
      const faculty = await User.findById(report.facultyId);
      const imageUrl = report.imagePath
        ? `${req.protocol}://${req.get('host')}/${report.imagePath.replace(/\\/g, '/')}`
        : null;

      return {
        ...report.toObject(),
        facultyName: faculty?.name || 'N/A',
        department: faculty?.department || 'N/A',
        imageUrl
      };
    }));

    res.json(enrichedReports);
  } catch (error) {
    console.error('Error fetching event reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

app.put('/api/reports/:id', async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { objective: req.body.objective },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report updated successfully', report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Error updating report' });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'Error deleting report' });
  }
});

// ✅ Optional: Get all reports (not grouped by event/faculty)
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().populate('facultyId');

    const reportsWithDetails = reports.map(report => {
      const faculty = report.facultyId;
      const imageUrl = report.imagePath
        ? `${req.protocol}://${req.get('host')}/${report.imagePath.replace(/\\/g, '/')}`
        : null;

      return {
        ...report.toObject(),
        facultyName: faculty?.name || 'N/A',
        department: faculty?.department || 'N/A',
        imageUrl
      };
    });

    res.json(reportsWithDetails);
  } catch (error) {
    console.error('Error fetching all reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching all reports' });
  }
});

// ====================== START SERVER ======================
app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
