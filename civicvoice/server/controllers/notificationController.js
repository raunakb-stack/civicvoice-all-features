const Notification = require('../models/Notification');

// Helper: create a notification and emit it via Socket.io
const createAndEmit = async (io, { recipient, type, title, message, complaint, icon }) => {
  const notif = await Notification.create({ recipient, type, title, message, complaint, icon });
  // Emit to that user's personal room
  if (io) io.to(`user:${recipient}`).emit('notification:new', notif);
  return notif;
};

// GET /api/notifications — my notifications (paginated)
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('complaint', 'title status');
    const unread = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAndEmit = createAndEmit;
