const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  actor:   { type: String, default: 'System' },
  time:    { type: Date, default: Date.now },
});

const complaintSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ['Roads & Infrastructure', 'Sanitation & Waste', 'Street Lighting', 'Water Supply', 'Parks & Gardens', 'General'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Overdue', 'Escalated'],
      default: 'Pending',
    },
    emergency:     { type: Boolean, default: false },
    citizen:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    city:          { type: String, default: 'Amravati' },
    location: {
      address:   { type: String, default: '' },
      lat:       { type: Number },
      lng:       { type: Number },
    },
    tags:          [{ type: String }],

    // Images — each entry has the Cloudinary URL + public_id for deletion
    images: [
      {
        url:      { type: String, required: true },
        publicId: { type: String, required: true },
        width:    Number,
        height:   Number,
        format:   String,
        bytes:    Number,
      },
    ],
    // Keep legacy field for backwards compatibility
    imageUrl: { type: String, default: '' },

    // Priority
    votes:         { type: Number, default: 0 },
    votedBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    priorityScore: { type: Number, default: 0 },

    // SLA
    slaDuration:   { type: Number, default: 48 }, // hours
    slaDeadline:   { type: Date },
    resolvedAt:    { type: Date },
    resolutionTime:{ type: Number }, // in hours

    // Escalation level: 0 = none, 1 = Senior Officer, 2 = Commissioner
    escalationLevel: { type: Number, default: 0 },

    // Satisfaction
    satisfactionRating: { type: Number, min: 1, max: 5 },
    ratedBy:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Timeline
    activityLog: [activityLogSchema],
  },
  { timestamps: true }
);

// Auto-set slaDeadline and add first log on create
complaintSchema.pre('save', function (next) {
  if (this.isNew) {
    this.slaDeadline = new Date(Date.now() + this.slaDuration * 60 * 60 * 1000);
    this.activityLog.push({ message: 'Complaint filed by citizen', actor: 'Citizen' });
    this.priorityScore = calcPriority(this.votes, this.emergency);
  }
  next();
});

function calcPriority(votes = 0, emergency = false) {
  return votes * 2 + (emergency ? 20 : 0);
}

complaintSchema.methods.recalcPriority = function () {
  this.priorityScore = calcPriority(this.votes, this.emergency);
};

module.exports = mongoose.model('Complaint', complaintSchema);
