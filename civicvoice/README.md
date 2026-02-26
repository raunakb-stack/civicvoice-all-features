# CivicVoice – Smart Municipal Transparency Platform
### HackGenX 2026 · Team CivicVoice

A production-ready full-stack civic governance web application with **12 advanced features**.

---

## 🏗 Tech Stack

| Layer       | Technology                                         |
|-------------|---------------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS (dark mode)        |
| Backend     | Node.js + Express.js + Socket.io                  |
| Database    | MongoDB + Mongoose                                |
| Auth        | JWT (role-based: citizen / department / admin)    |
| Maps        | Leaflet.js + OpenStreetMap                        |
| Charts      | Recharts (bar, pie, heatmap)                      |
| Images      | Cloudinary CDN (drag-drop, auto-optimize)         |
| Email       | Nodemailer (HTML templates)                       |
| SMS         | Twilio                                            |
| AI          | Claude API (auto-categorize complaints)           |
| PDF         | PDFKit (weekly dept reports)                      |
| i18n        | i18next (English, Hindi, Marathi)                 |
| PWA         | Service Worker + Web Manifest (installable)       |

---

## 📁 Complete Folder Structure

```
civicvoice/
│
├── README.md
│
├── 🖥 client/                          FRONTEND (React + Vite)
│   ├── index.html                      PWA meta tags, fonts, leaflet CSS
│   ├── vite.config.js
│   ├── tailwind.config.js              darkMode: 'class'
│   ├── postcss.config.js
│   ├── package.json
│   └── public/
│       ├── manifest.json               ← PWA web manifest
│       ├── sw.js                       ← Service Worker (cache-first)
│       └── icons/                      ← App icons (72–512px)
│
│   └── src/
│       ├── App.jsx                     Router + DarkMode + Socket + Auth providers
│       ├── main.jsx                    Entry (imports i18n)
│       ├── i18n.js                     i18next setup (EN/HI/MR)
│       ├── index.css                   Tailwind + dark: variants
│       │
│       ├── api/
│       │   └── axios.js                JWT interceptor
│       │
│       ├── contexts/
│       │   ├── AuthContext.jsx         Global auth state
│       │   ├── DarkModeContext.jsx     ← Dark mode toggle + localStorage
│       │   └── SocketContext.jsx       ← Socket.io client context
│       │
│       ├── hooks/
│       │   └── usePWA.js               ← Install prompt handler
│       │
│       ├── locales/
│       │   ├── en/translation.json     English
│       │   ├── hi/translation.json     ← Hindi
│       │   └── mr/translation.json     ← Marathi
│       │
│       ├── components/
│       │   ├── Layout.jsx              Sidebar + Navbar + PWAInstallBanner
│       │   ├── Navbar.jsx              Dark toggle, lang switcher, notifications
│       │   ├── Sidebar.jsx             i18n nav labels, dark mode
│       │   ├── ComplaintCard.jsx       Photo thumbnails, escalation badge
│       │   ├── MapView.jsx             Leaflet map
│       │   ├── SLATimer.jsx            Live countdown
│       │   ├── ActivityLog.jsx         Timeline
│       │   ├── StarRating.jsx          1–5 stars
│       │   ├── StatusBadge.jsx         Color-coded status
│       │   ├── StatsPanel.jsx          i18n live stats
│       │   ├── ImageUploader.jsx       Drag-drop Cloudinary
│       │   ├── ImageGallery.jsx        Lightbox viewer
│       │   ├── NotificationBell.jsx    ← Real-time inbox (Socket.io)
│       │   ├── AICategorizBtn.jsx      ← AI auto-fill button
│       │   ├── HeatmapChart.jsx        ← Day×Hour heatmap
│       │   └── PWAInstallBanner.jsx    ← Install prompt UI
│       │
│       └── pages/
│           ├── Login.jsx               Demo account quick-fill
│           ├── Register.jsx
│           ├── Dashboard.jsx           i18n + dark mode
│           ├── ComplaintFeed.jsx       Filter, search, paginate
│           ├── NewComplaint.jsx        ← AI auto-fill + image upload
│           ├── ComplaintDetail.jsx     Gallery, timeline, rating
│           ├── DeptDashboard.jsx       ← Heatmap tab + PDF download
│           ├── AdminDashboard.jsx      Delete + cross-dept analytics
│           ├── MapPage.jsx             Leaflet live map
│           └── ProfilePage.jsx         ← Points, badges, history
│
└── ⚙️ server/                          BACKEND (Node + Express)
    ├── server.js                       Socket.io + rate limiting + all routes
    ├── .env.example                    All env vars documented
    ├── package.json
    │
    ├── scripts/
    │   └── seed.js                     ← 50 realistic complaints + demo users
    │
    ├── models/
    │   ├── User.js                     Citizen / Dept / Admin
    │   ├── Complaint.js                SLA + logs + escalation + images
    │   └── Notification.js             ← In-app notification model
    │
    ├── routes/
    │   ├── auth.js                     + validation rules
    │   ├── complaints.js               + validation rules
    │   ├── departments.js
    │   ├── stats.js
    │   ├── upload.js                   Cloudinary
    │   ├── notifications.js            ← Get / mark-read
    │   ├── ai.js                       ← Claude API categorize
    │   └── reports.js                  ← PDF weekly report
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── complaintController.js      + Socket emit + email/SMS
    │   ├── statsController.js
    │   ├── uploadController.js
    │   ├── notificationController.js   ← createAndEmit helper
    │   ├── aiController.js             ← Claude API + keyword fallback
    │   └── reportController.js         ← PDFKit weekly report
    │
    ├── middleware/
    │   ├── auth.js                     JWT protect + role guard
    │   ├── upload.js                   Multer memory storage
    │   └── validate.js                 ← express-validator rules
    │
    └── utils/
        ├── priorityScore.js            Priority formula + escalation logic
        ├── cloudinary.js               Cloudinary SDK config
        ├── mailer.js                   ← Nodemailer HTML email templates
        └── sms.js                      ← Twilio SMS
```

---

## 🚀 Quick Start (3 commands)

```bash
# 1. Backend
cd server
cp .env.example .env     # Fill in your values
npm install
npm run seed             # Seed 50 demo complaints
npm run dev              # → http://localhost:5000

# 2. Frontend
cd client
npm install
npm run dev              # → http://localhost:5173
```

---

## 🔐 Demo Accounts

| Role       | Email                  | Password   |
|------------|------------------------|------------|
| Citizen    | citizen@demo.com       | demo1234   |
| Department | department@demo.com    | demo1234   |
| Admin      | admin@demo.com         | demo1234   |

---

## ✅ All 12 Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Real-time Notifications (Socket.io) | ✅ |
| 2 | AI Auto-Categorize (Claude API)     | ✅ |
| 3 | SMS Alerts (Twilio)                 | ✅ |
| 4 | Email Alerts (Nodemailer HTML)      | ✅ |
| 5 | MongoDB Seed Script (50 complaints) | ✅ |
| 6 | Weekly PDF Report (PDFKit)          | ✅ |
| 7 | Heatmap Analytics (Day × Hour)      | ✅ |
| 8 | Citizen Profile + Badges            | ✅ |
| 9 | Rate Limiting (express-rate-limit)  | ✅ |
|10 | Input Validation (express-validator)| ✅ |
|11 | PWA (manifest + service worker)     | ✅ |
|12 | Dark Mode (Tailwind dark:class)     | ✅ |
|13 | Multi-language EN / हि / म          | ✅ |

---

## 🌐 Environment Variables

```env
# Core
PORT=5000
MONGO_URI=mongodb://localhost:27017/civicvoice
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Cloudinary (free tier at cloudinary.com)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Nodemailer / Gmail (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="CivicVoice <no-reply@civicvoice.in>"

# Claude AI (optional — falls back to keyword rules)
ANTHROPIC_API_KEY=sk-ant-xxx

# Feature flags
ENABLE_SMS=true
ENABLE_EMAIL=true
ENABLE_AI=true
```

---

## 📡 API Reference

```
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me

GET   /api/complaints            ?department= &status= &emergency= &page= &limit=
GET   /api/complaints/map
GET   /api/complaints/:id
POST  /api/complaints
PUT   /api/complaints/:id/status
POST  /api/complaints/:id/vote
POST  /api/complaints/:id/rate
DELETE /api/complaints/:id       (admin only)

GET   /api/stats/city
GET   /api/stats/department/:dept

POST  /api/upload/images         multipart/form-data, field: images (max 4)
DELETE /api/upload/images/:publicId

GET   /api/notifications
PUT   /api/notifications/read-all
PUT   /api/notifications/:id/read

POST  /api/ai/categorize         { title, description }

GET   /api/reports/weekly/:dept  → PDF download

GET   /api/departments
GET   /api/health
```

---

## 👥 Team

| Member              | Role                      |
|---------------------|---------------------------|
| Raunak Bhusare      | Team Lead / Full Stack     |
| Vyanktesh Dudhadmal | Product Manager / AI Eng  |
| Om Madhapure        | Backend Developer          |
| Rohan Andhale       | Frontend / UI/UX           |

**HackGenX 2026 · CivicVoice**
