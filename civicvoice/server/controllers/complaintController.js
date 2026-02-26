const Complaint  = require('../models/Complaint');
const User       = require('../models/User');
const { calcPriorityScore, getEscalationLevel } = require('../utils/priorityScore');
const { createAndEmit }  = require('./notificationController');
const { sendStatusEmail } = require('../utils/mailer');
const { sendStatusSMS }   = require('../utils/sms');

// Helper: update escalation on any complaint fetch
const applyEscalation = async (complaint) => {
  const level = getEscalationLevel(complaint.createdAt, complaint.status);
  if (level !== complaint.escalationLevel) {
    complaint.escalationLevel = level;
    if (level === 1) {
      complaint.activityLog.push({ message: 'Escalated to Senior Officer (48h SLA breach)', actor: 'System' });
    } else if (level === 2) {
      complaint.status = 'Escalated';
      complaint.activityLog.push({ message: 'Escalated to Commissioner (5-day breach)', actor: 'System' });
    }
    await complaint.save();
  }
  return complaint;
};

// GET /api/complaints
exports.getComplaints = async (req, res) => {
  try {
    const { department, status, city, emergency, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status)     filter.status = status;
    if (city)       filter.city = city;
    if (emergency)  filter.emergency = emergency === 'true';

    // Department users see only their dept
    if (req.user.role === 'department') filter.department = req.user.department;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email civicPoints')
      .populate('assignedTo', 'name email')
      .sort({ priorityScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Run escalation check
    for (const c of complaints) await applyEscalation(c);

    // Mark overdue
    const now = Date.now();
    for (const c of complaints) {
      if (c.status !== 'Resolved' && c.status !== 'Escalated' && new Date(c.slaDeadline) < now) {
        if (c.status !== 'Overdue') {
          c.status = 'Overdue';
          c.activityLog.push({ message: 'SLA expired — marked Overdue', actor: 'System' });
          await c.save();
        }
      }
    }

    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/map — lightweight for map markers
exports.getMapComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ 'location.lat': { $exists: true } })
      .select('title status department emergency location priorityScore createdAt')
      .limit(500);
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints/:id
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email civicPoints')
      .populate('assignedTo', 'name email department');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    await applyEscalation(complaint);
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, department, emergency, location, tags, imageUrl, images } = req.body;
    const complaint = await Complaint.create({
      title, description, department,
      emergency: !!emergency,
      citizen: req.user._id,
      city: req.user.city || 'Amravati',
      location: location || {},
      tags: tags || [],
      images: images || [],           // array of { url, publicId, ... }
      imageUrl: images?.[0]?.url || imageUrl || '',  // legacy fallback
    });
    // Award civic points
    await User.findByIdAndUpdate(req.user._id, { $inc: { civicPoints: 20 } });
    const populated = await complaint.populate('citizen', 'name email');
    res.status(201).json({ complaint: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/complaints/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('citizen', 'name email phone');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'department' && complaint.department !== req.user.department)
      return res.status(403).json({ message: 'Not authorized for this department' });

    const oldStatus = complaint.status;
    complaint.status = status;

    if (status === 'In Progress' && !complaint.assignedTo) {
      complaint.assignedTo = req.user._id;
      complaint.activityLog.push({ message: `Assigned to ${req.user.name}`, actor: req.user.name });
    }
    if (status === 'In Progress')
      complaint.activityLog.push({ message: 'Work started — status changed to In Progress', actor: req.user.name });
    if (status === 'Resolved') {
      complaint.resolvedAt    = new Date();
      complaint.resolutionTime = (Date.now() - new Date(complaint.createdAt)) / 3600000;
      complaint.activityLog.push({ message: 'Complaint marked as Resolved', actor: req.user.name });
    }
    if (note) complaint.activityLog.push({ message: note, actor: req.user.name });
    await complaint.save();

    const io = req.io || req.app.get('io');
    const statusIcons = { 'In Progress': '🔧', Resolved: '✅', Overdue: '🚨', Escalated: '⚡', Pending: '⏳' };

    // 1️⃣ In-app notification to citizen
    if (complaint.citizen?._id) {
      await createAndEmit(io, {
        recipient:  complaint.citizen._id,
        type:       'status_update',
        title:      `Complaint ${status}`,
        message:    `Your complaint "${complaint.title.slice(0,60)}" is now ${status}`,
        complaint:  complaint._id,
        icon:       statusIcons[status] || '🔔',
      });
    }

    // 2️⃣ Broadcast updated complaint to dept room
    if (io) {
      io.to(`dept:${complaint.department}`).emit('complaint:updated', {
        _id: complaint._id, status, priorityScore: complaint.priorityScore,
      });
    }

    // 3️⃣ Email notification (fire-and-forget)
    if (process.env.ENABLE_EMAIL === 'true' && complaint.citizen?.email) {
      sendStatusEmail(complaint.citizen.email, complaint.citizen.name, complaint).catch(console.error);
    }

    // 4️⃣ SMS notification (fire-and-forget)
    if (process.env.ENABLE_SMS === 'true' && complaint.citizen?.phone) {
      sendStatusSMS(complaint.citizen.phone, complaint.title, status).catch(console.error);
    }

    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/complaints/:id/vote
exports.voteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    const userId = req.user._id.toString();
    const alreadyVoted = complaint.votedBy.map(v => v.toString()).includes(userId);

    if (alreadyVoted) {
      complaint.votes = Math.max(0, complaint.votes - 1);
      complaint.votedBy = complaint.votedBy.filter(v => v.toString() !== userId);
    } else {
      complaint.votes += 1;
      complaint.votedBy.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $inc: { civicPoints: 5 } });
    }

    complaint.recalcPriority();
    await complaint.save();
    res.json({ votes: complaint.votes, priorityScore: complaint.priorityScore, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/complaints/:id/rate
exports.rateComplaint = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.status !== 'Resolved')
      return res.status(400).json({ message: 'Can only rate resolved complaints' });
    if (complaint.citizen.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the complaint author can rate' });
    if (complaint.satisfactionRating)
      return res.status(400).json({ message: 'Already rated' });

    complaint.satisfactionRating = rating;
    complaint.ratedBy = req.user._id;
    complaint.activityLog.push({ message: `Citizen rated resolution: ${rating}/5 ⭐`, actor: req.user.name });
    await complaint.save();

    // Update department user's average rating
    if (complaint.assignedTo) {
      const deptUser = await User.findById(complaint.assignedTo);
      if (deptUser) {
        const newTotal = deptUser.totalRatings + 1;
        deptUser.averageRating = ((deptUser.averageRating * deptUser.totalRatings) + rating) / newTotal;
        deptUser.totalRatings = newTotal;
        await deptUser.save();
      }
    }
    res.json({ complaint });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/complaints/:id (admin only)
exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
