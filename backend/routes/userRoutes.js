const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
