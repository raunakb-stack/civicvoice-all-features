const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['citizen', 'department', 'admin'], default: 'citizen' },
    department: {
      type: String,
      enum: ['Roads & Infrastructure', 'Sanitation & Waste', 'Street Lighting', 'Water Supply', 'Parks & Gardens', 'General'],
      default: 'General',
    },
    city: { type: String, default: 'Amravati' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    civicPoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strip password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
