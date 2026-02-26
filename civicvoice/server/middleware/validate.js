const { body, validationResult } = require('express-validator');

// Reusable handler: returns 400 if there are validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};

// Auth validators
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 60 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('role').optional().isIn(['citizen', 'department', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

// Complaint validators
const complaintRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 10, max: 2000 }),
  body('department').notEmpty().withMessage('Department is required')
    .isIn(['Roads & Infrastructure', 'Sanitation & Waste', 'Street Lighting', 'Water Supply', 'Parks & Gardens', 'General']),
  body('emergency').optional().isBoolean(),
  body('location.lat').optional().isFloat({ min: -90,  max: 90  }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
];

const statusRules = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'In Progress', 'Resolved', 'Overdue', 'Escalated']),
  body('note').optional().isLength({ max: 500 }),
];

const ratingRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  complaintRules,
  statusRules,
  ratingRules,
};
