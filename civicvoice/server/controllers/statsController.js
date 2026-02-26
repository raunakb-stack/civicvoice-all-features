const Complaint = require('../models/Complaint');
const User = require('../models/User');

// GET /api/stats/city
exports.getCityStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [
      total, todayTotal, resolvedToday, overdue, escalated, activeUsers,
      resolutionData, deptBreakdown
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ createdAt: { $gte: today } }),
      Complaint.countDocuments({ status: 'Resolved', resolvedAt: { $gte: today } }),
      Complaint.countDocuments({ status: 'Overdue' }),
      Complaint.countDocuments({ status: 'Escalated' }),
      User.countDocuments({ isActive: true }),
      Complaint.aggregate([
        { $match: { resolutionTime: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$department', total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          pending:  { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          overdue:  { $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] } },
          avgPriority: { $avg: '$priorityScore' }
        }},
        { $sort: { total: -1 } }
      ])
    ]);

    const avgResolutionHours = resolutionData[0]?.avg?.toFixed(1) || 0;
    const resolvedTotal = await Complaint.countDocuments({ status: 'Resolved' });
    const resolutionRate = total > 0 ? ((resolvedTotal / total) * 100).toFixed(1) : 0;

    res.json({
      total, todayTotal, resolvedToday, overdue, escalated,
      activeUsers, avgResolutionHours, resolutionRate,
      deptBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/department/:dept
exports.getDeptStats = async (req, res) => {
  try {
    const dept = decodeURIComponent(req.params.dept);
    const filter = { department: dept };

    const [total, pending, inProgress, resolved, overdue, escalated, avgRatingData, avgResData] = await Promise.all([
      Complaint.countDocuments(filter),
      Complaint.countDocuments({ ...filter, status: 'Pending' }),
      Complaint.countDocuments({ ...filter, status: 'In Progress' }),
      Complaint.countDocuments({ ...filter, status: 'Resolved' }),
      Complaint.countDocuments({ ...filter, status: 'Overdue' }),
      Complaint.countDocuments({ ...filter, status: 'Escalated' }),
      Complaint.aggregate([{ $match: { ...filter, satisfactionRating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$satisfactionRating' } } }]),
      Complaint.aggregate([{ $match: { ...filter, resolutionTime: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }]),
    ]);

    res.json({
      dept, total, pending, inProgress, resolved, overdue, escalated,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
      avgRating: avgRatingData[0]?.avg?.toFixed(1) || 'N/A',
      avgResolutionHours: avgResData[0]?.avg?.toFixed(1) || 'N/A',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
