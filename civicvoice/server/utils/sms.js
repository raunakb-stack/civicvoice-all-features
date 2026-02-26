let twilioClient = null;

const getClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

const STATUS_MSGS = {
  'In Progress': 'is being worked on',
  Resolved:      'has been resolved',
  Overdue:       'is overdue and escalated',
  Escalated:     'has been escalated to Commissioner',
};

exports.sendStatusSMS = async (phone, complaintTitle, status) => {
  const client = getClient();
  if (!client) return; // Twilio not configured

  const verb   = STATUS_MSGS[status] || `is now ${status}`;
  const body   = `[CivicVoice] Your complaint "${complaintTitle.slice(0, 50)}" ${verb}. Visit civicvoice.in to track.`;

  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to:   phone,
  });
  console.log(`📱 SMS sent to ${phone}`);
};
