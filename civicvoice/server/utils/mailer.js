const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STATUS_COLORS = {
  Pending:      '#eab308',
  'In Progress':'#3b82f6',
  Resolved:     '#22c55e',
  Overdue:      '#ef4444',
  Escalated:    '#a855f7',
};

const htmlTemplate = (name, complaint) => {
  const color = STATUS_COLORS[complaint.status] || '#e8820c';
  return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:DM Sans,Arial,sans-serif;background:#f5f0e8;margin:0;padding:20px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <!-- Header -->
      <div style="background:#0f0f0f;padding:24px 32px;display:flex;align-items:center;gap:12px">
        <div style="background:#e8820c;border-radius:8px;padding:8px 14px;font-size:18px;font-weight:900;color:#fff;letter-spacing:2px">CV</div>
        <span style="color:#f5f0e8;font-size:18px;font-weight:700;letter-spacing:1px">CivicVoice</span>
      </div>
      <!-- Body -->
      <div style="padding:32px">
        <p style="color:#555;font-size:14px;margin:0 0 8px">Hello <strong>${name}</strong>,</p>
        <h2 style="margin:0 0 20px;font-size:20px;color:#0f0f0f">Your complaint status has been updated</h2>
        <!-- Status badge -->
        <div style="display:inline-block;background:${color}20;border:1px solid ${color}40;color:${color};font-weight:700;font-size:13px;padding:6px 14px;border-radius:20px;margin-bottom:20px">
          ${complaint.status}
        </div>
        <!-- Complaint card -->
        <div style="background:#fafafa;border:1px solid #e8e0d4;border-left:4px solid ${color};border-radius:8px;padding:18px;margin-bottom:24px">
          <p style="font-size:12px;color:#999;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.5px">${complaint.department}</p>
          <p style="font-size:16px;font-weight:700;color:#0f0f0f;margin:0 0 8px">${complaint.title}</p>
          <p style="font-size:13px;color:#666;margin:0">📍 ${complaint.location?.address || complaint.city}</p>
        </div>
        ${complaint.status === 'Resolved' ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="color:#15803d;font-weight:700;margin:0 0 4px">✅ Issue Resolved!</p>
          <p style="color:#166534;font-size:13px;margin:0">Please rate your experience to help improve our service.</p>
        </div>` : ''}
        <a href="${process.env.CLIENT_URL}/complaints/${complaint._id}"
          style="display:inline-block;background:#e8820c;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
          View Complaint →
        </a>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #e8e0d4;font-size:11px;color:#aaa">
        CivicVoice – Smart Municipal Transparency Platform · ${complaint.city}
      </div>
    </div>
  </body>
  </html>`;
};

exports.sendStatusEmail = async (email, name, complaint) => {
  if (!process.env.SMTP_USER) return; // skip if not configured
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || 'CivicVoice <no-reply@civicvoice.in>',
    to:      email,
    subject: `[CivicVoice] Your complaint is now ${complaint.status}`,
    html:    htmlTemplate(name, complaint),
  });
  console.log(`📧 Email sent to ${email} (status: ${complaint.status})`);
};

exports.sendWelcomeEmail = async (email, name) => {
  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: 'Welcome to CivicVoice! 🎉',
    html: `<div style="font-family:Arial,sans-serif;padding:32px;max-width:480px;margin:auto">
      <h2>Welcome, ${name}! 👋</h2>
      <p>You've joined CivicVoice — Amravati's smart civic transparency platform.</p>
      <p>Start reporting issues and earn Civic Points for every contribution!</p>
      <a href="${process.env.CLIENT_URL}" style="background:#e8820c;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:700">Go to Dashboard →</a>
    </div>`,
  });
};
