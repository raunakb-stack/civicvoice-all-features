const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['status_update', 'new_complaint', 'escalation', 'resolution', 'rating_request', 'sla_warning'],
      required: true,
    },
    title:       { type: String, required: true },
    message:     { type: String, required: true },
    complaint:   { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    read:        { type: Boolean, default: false },
    icon:        { type: String, default: '🔔' },
  },
  { timestamps: true }
);

// Index for fast unread queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
