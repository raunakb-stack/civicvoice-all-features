require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Complaint = require('../models/Complaint');

const DEPARTMENTS = [
  'Roads & Infrastructure', 'Sanitation & Waste',
  'Street Lighting', 'Water Supply', 'Parks & Gardens',
];

const AREAS = [
  'Rajapeth', 'Badnera Road', 'Camp Area', 'Jaistambh Chowk',
  'Cotton Market', 'Shivajinagar', 'Morshi Road', 'Paratwada Naka',
  'Irwin Square', 'Gandhi Chowk', 'Hanumannagar', 'Vyankatesh Nagar',
];

const COMPLAINT_TEMPLATES = [
  { dept: 'Roads & Infrastructure', items: [
    { t: 'Deep pothole blocking main road near bus stand', d: 'A large pothole has formed on the main road near the central bus stand. Multiple vehicles have been damaged. Depth is approximately 1 foot. Urgent repair needed before monsoon.', e: true },
    { t: 'Broken footpath tiles causing injuries to pedestrians', d: 'The footpath tiles on the main market road are broken and have sharp edges. Three elderly people have tripped in the last week. Immediate replacement needed.', e: false },
    { t: 'Road divider damaged after accident, causing traffic chaos', d: 'The road divider near the railway crossing was damaged in an accident two weeks ago. Traffic is chaotic during peak hours. No action taken despite previous complaints.', e: false },
    { t: 'Waterlogging on main road after light rain', d: 'Even after 20 minutes of rain, the main road near Jaistambh Chowk gets completely waterlogged. The drainage system is blocked. This has been happening for years.', e: true },
    { t: 'Bridge railing broken — major accident risk', d: 'The railing on the Morshi Road bridge has completely collapsed on one side. Pedestrians and cyclists are at serious risk of falling into the canal below.', e: true },
    { t: 'Speed breakers missing on school zone road', d: 'The speed breakers outside the municipal school were removed during road repair 3 months ago and never replaced. Vehicles speed through at dangerous speeds during school hours.', e: false },
    { t: 'Unpaved road turns into mud every monsoon', d: 'The internal road in Sector 4 has never been properly paved. Every monsoon it becomes completely unusable mud. Residents have been complaining for 5 years.', e: false },
    { t: 'Traffic signal not working at major intersection', d: 'The traffic signal at the main 4-way crossing near Cotton Market has been non-functional for 2 weeks. Near-miss accidents happening daily. Police cannot manage manually all day.', e: true },
  ]},
  { dept: 'Sanitation & Waste', items: [
    { t: 'Garbage bins overflowing outside market area', d: 'The three municipal garbage bins outside the wholesale market have been overflowing for 4 days. The smell is unbearable and stray dogs are scattering waste everywhere.', e: false },
    { t: 'Open drain causing disease outbreak risk in colony', d: 'The open drainage channel running through Shivajinagar colony is overflowing with sewage. Multiple children have been falling sick. Health department must inspect immediately.', e: true },
    { t: 'Illegal garbage dumping site near school', d: 'People have been illegally dumping construction debris and household waste on the empty plot near the primary school. The pile is now 6 feet high and a health hazard.', e: false },
    { t: 'Sanitation workers not collecting waste for a week', d: 'Our ward has not received garbage collection for 7 days straight. We have contacted the ward office but no response. The entire street smells terrible.', e: false },
    { t: 'Sewage line blocked causing overflow on road', d: 'The main sewage line near our colony is completely blocked. Raw sewage is overflowing on the road and entering homes. This is a health emergency.', e: true },
    { t: 'No dustbins in public park — waste everywhere', d: 'The municipal park on Rajapeth has zero dustbins installed. Visitors throw waste anywhere. The park is littered with plastic bags, food wrappers, and bottles daily.', e: false },
  ]},
  { dept: 'Street Lighting', items: [
    { t: 'Entire street dark for 2 months — safety concern', d: 'The complete stretch from Badnera Road to Cotton Market has had no street lighting for almost 2 months. Three incidents of theft and one eve-teasing case have been reported in this darkness.', e: true },
    { t: 'Street lights on all day wasting electricity', d: 'The street lights in our colony remain on throughout the day — from 6am to 10pm. This is a massive waste of electricity. The timer circuit appears to be faulty.', e: false },
    { t: 'Light poles fallen during storm — not removed', d: 'Two street light poles fell during last week\'s storm. They are lying across the footpath. One has live wires exposed. This is extremely dangerous.', e: true },
    { t: 'School route completely unlit after 7 PM', d: 'Children attending evening coaching classes have to walk through a completely dark stretch. Parents are very concerned. Please install lights on priority before an incident occurs.', e: false },
    { t: 'Blinking street light causing migraine to residents', d: 'The street light outside Building No. 14 has been blinking continuously for 3 weeks. The constant flickering is causing severe headaches and sleep disturbance to nearby residents.', e: false },
  ]},
  { dept: 'Water Supply', items: [
    { t: 'No water supply for 5 consecutive days', d: 'Ward 12 residents have received no piped water for 5 days straight. We are forced to buy water tankers at Rs 500 per trip. This is unaffordable and unacceptable.', e: true },
    { t: 'Water supply contaminated — brown color and bad smell', d: 'The water supplied since yesterday is brown in color with a foul smell. Multiple families are facing stomach issues. Water quality testing must be done immediately.', e: true },
    { t: 'Main water pipe burst on road — water wasted for days', d: 'A major water supply pipe has burst on Shivajinagar main road. Water has been flowing onto the road for 3 days. Thousands of liters are wasted daily despite multiple complaints.', e: true },
    { t: 'Low water pressure — only ground floor gets water', d: 'The water pressure in our area is so low that residents above ground floor get no water. We have to wake up at 5am to collect water. This has been going on for months.', e: false },
    { t: 'Water meter showing wrong readings, overbilling', d: 'Our water meter has been malfunctioning for 3 months. Despite consuming normal amounts, our bills are 4x higher. We have written to the water office but no response.', e: false },
    { t: 'Illegal water connection affecting supply to whole area', d: 'Someone has made an illegal water connection that is diverting supply from our entire street. The area receives water for only 30 minutes instead of 3 hours. Inspection needed urgently.', e: false },
  ]},
  { dept: 'Parks & Gardens', items: [
    { t: 'Park benches broken — elderly cannot sit', d: 'All 8 benches in the Rajapeth public park are broken or missing. Elderly residents who come for morning walks have nowhere to sit. Replacement needed urgently.', e: false },
    { t: 'Dangerous tree branch about to fall on pathway', d: 'A massive dead tree branch in the Central Park is hanging loose over the main walking path. It could fall anytime injuring someone. Emergency tree trimming needed today.', e: true },
    { t: 'Park lights not working — unsafe at night', d: 'The garden has zero working lights after 7 PM. Antisocial elements have started gathering. Women and children no longer feel safe visiting. Park is getting misused.', e: false },
    { t: 'Playground equipment rusted and broken — child injury risk', d: 'The children\'s play equipment in the park is severely rusted and multiple parts are broken. A child suffered cuts last week. All equipment needs immediate inspection and repair.', e: true },
    { t: 'Water sprinklers broken — plants dying', d: 'The automatic sprinkler system in the botanical garden section has been broken for a month. The rare and expensive plants planted by the municipality are dying due to no watering.', e: false },
  ]},
];

const STATUSES  = ['Pending', 'Pending', 'In Progress', 'In Progress', 'Resolved', 'Overdue'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clean up
  await User.deleteMany({});
  await Complaint.deleteMany({});
  console.log('🗑️  Cleaned old data');

  const hashedPw = await bcrypt.hash('demo1234', 12);

  // ── Demo Users ──────────────────────────────────────────────────────────────
  const citizenUsers = await User.insertMany([
    { name: 'Priya Sharma',    email: 'citizen@demo.com',    password: hashedPw, role: 'citizen',    city: 'Amravati', civicPoints: 340, phone: '+919876543210' },
    { name: 'Vijay Patil',     email: 'vijay@demo.com',      password: hashedPw, role: 'citizen',    city: 'Amravati', civicPoints: 210 },
    { name: 'Meena Kulkarni',  email: 'meena@demo.com',      password: hashedPw, role: 'citizen',    city: 'Amravati', civicPoints: 180 },
    { name: 'Suresh Bawane',   email: 'suresh@demo.com',     password: hashedPw, role: 'citizen',    city: 'Amravati', civicPoints: 95  },
    { name: 'Anjali Deshmukh', email: 'anjali@demo.com',     password: hashedPw, role: 'citizen',    city: 'Amravati', civicPoints: 60  },
  ]);

  const deptUsers = await User.insertMany(
    DEPARTMENTS.map((dept, i) => ({
      name: `${dept.split(' ')[0]} Officer`,
      email: `dept${i+1}@demo.com`,
      password: hashedPw,
      role: 'department',
      department: dept,
      city: 'Amravati',
      averageRating: (3.5 + Math.random() * 1.5).toFixed(1),
      totalRatings: Math.floor(Math.random() * 30) + 5,
    }))
  );

  const adminUser = await User.create({
    name: 'Admin', email: 'admin@demo.com', password: hashedPw,
    role: 'admin', city: 'Amravati', civicPoints: 999,
  });

  // Special easy-to-remember login
  await User.create({ name: 'Department User', email: 'department@demo.com', password: hashedPw, role: 'department', department: 'Roads & Infrastructure', city: 'Amravati' });

  console.log('👤 Created users:', citizenUsers.length + deptUsers.length + 2);

  // ── Seed Complaints ──────────────────────────────────────────────────────────
  const complaints = [];
  const lats = [20.922, 20.930, 20.940, 20.915, 20.935, 20.928, 20.910, 20.945];
  const lngs = [77.748, 77.760, 77.775, 77.740, 77.785, 77.752, 77.765, 77.778];

  COMPLAINT_TEMPLATES.forEach((template, deptIdx) => {
    template.items.forEach((item, itemIdx) => {
      const citizen = citizenUsers[Math.floor(Math.random() * citizenUsers.length)];
      const votes   = Math.floor(Math.random() * 120);
      const status  = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const area    = AREAS[Math.floor(Math.random() * AREAS.length)];
      const locIdx  = (deptIdx * 10 + itemIdx) % lats.length;
      const daysAgo = Math.floor(Math.random() * 14);

      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const slaDeadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

      const c = {
        title:       item.t,
        description: item.d,
        department:  template.dept,
        emergency:   item.e,
        citizen:     citizen._id,
        city:        'Amravati',
        status,
        votes,
        priorityScore: votes * 2 + (item.e ? 20 : 0),
        location: {
          address: `${area}, Amravati, Maharashtra`,
          lat: lats[locIdx] + (Math.random() - 0.5) * 0.01,
          lng: lngs[locIdx] + (Math.random() - 0.5) * 0.01,
        },
        tags: [item.t.split(' ')[0], template.dept.split(' ')[0], area.replace(' ', '')],
        createdAt,
        slaDeadline,
        activityLog: [{ message: 'Complaint filed by citizen', actor: citizen.name, time: createdAt }],
      };

      if (status === 'Resolved') {
        const resolvedAt = new Date(createdAt.getTime() + (Math.random() * 40 + 2) * 3600000);
        c.resolvedAt    = resolvedAt;
        c.resolutionTime = (resolvedAt - createdAt) / 3600000;
        c.satisfactionRating = Math.floor(Math.random() * 3) + 3;
        c.activityLog.push(
          { message: 'Assigned to department officer', actor: 'System', time: new Date(createdAt.getTime() + 3600000) },
          { message: 'Work started', actor: deptUsers[deptIdx % deptUsers.length].name, time: new Date(createdAt.getTime() + 7200000) },
          { message: 'Complaint marked as Resolved', actor: deptUsers[deptIdx % deptUsers.length].name, time: resolvedAt },
        );
        c.assignedTo = deptUsers[deptIdx % deptUsers.length]._id;
      }
      if (status === 'In Progress') {
        c.activityLog.push({ message: 'Work in progress', actor: deptUsers[deptIdx % deptUsers.length].name, time: new Date(createdAt.getTime() + 5400000) });
        c.assignedTo = deptUsers[deptIdx % deptUsers.length]._id;
      }

      complaints.push(c);
    });
  });

  await Complaint.insertMany(complaints);
  console.log(`📋 Seeded ${complaints.length} complaints`);

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Accounts (password: demo1234)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Citizen:    citizen@demo.com');
  console.log('Department: department@demo.com  (Roads)');
  console.log('Admin:      admin@demo.com');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
