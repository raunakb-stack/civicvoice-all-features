const PDFDocument = require('pdfkit');
const Complaint   = require('../models/Complaint');

// GET /api/reports/weekly/:dept
exports.weeklyReport = async (req, res) => {
  try {
    const dept  = decodeURIComponent(req.params.dept);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [complaints, stats] = await Promise.all([
      Complaint.find({ department: dept, createdAt: { $gte: since } })
        .populate('citizen', 'name')
        .sort({ priorityScore: -1 })
        .limit(100),
      Complaint.aggregate([
        { $match: { department: dept, createdAt: { $gte: since } } },
        { $group: {
            _id: null,
            total:      { $sum: 1 },
            resolved:   { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
            overdue:    { $sum: { $cond: [{ $eq: ['$status', 'Overdue']  }, 1, 0] } },
            escalated:  { $sum: { $cond: [{ $eq: ['$status', 'Escalated'] }, 1, 0] } },
            avgRes:     { $avg: '$resolutionTime' },
            avgRating:  { $avg: '$satisfactionRating' },
        }},
      ]),
    ]);

    const s = stats[0] || { total: 0, resolved: 0, overdue: 0, escalated: 0, avgRes: 0, avgRating: 0 };
    const resRate = s.total > 0 ? ((s.resolved / s.total) * 100).toFixed(1) : 0;

    // ── Build PDF ──────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CivicVoice_Weekly_${dept.replace(/\s+/g, '_')}.pdf"`);
    doc.pipe(res);

    const W = doc.page.width - 100; // content width

    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill('#0f0f0f');
    doc.fillColor('#e8820c').fontSize(22).font('Helvetica-Bold').text('CivicVoice', 50, 20);
    doc.fillColor('#aaaaaa').fontSize(11).font('Helvetica').text('Smart Municipal Transparency Platform', 50, 48);
    doc.fillColor('#ffffff').fontSize(10).text(`Weekly Report — ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 400, 48, { align: 'right', width: 200 });

    doc.moveDown(3);

    // Title
    doc.fillColor('#0f0f0f').fontSize(16).font('Helvetica-Bold')
      .text(`Department: ${dept}`, 50);
    doc.fontSize(10).font('Helvetica').fillColor('#666')
      .text(`Period: ${since.toLocaleDateString('en-IN')} — ${new Date().toLocaleDateString('en-IN')}`)
      .moveDown(1.5);

    // Stats boxes (draw 4 in a row)
    const boxes = [
      { label: 'Total',      value: s.total,                    color: '#e8820c' },
      { label: 'Resolved',   value: s.resolved,                 color: '#22c55e' },
      { label: 'Overdue',    value: s.overdue,                   color: '#ef4444' },
      { label: 'Resolution', value: `${resRate}%`,              color: '#3b82f6' },
    ];
    const bw = (W - 30) / 4;
    boxes.forEach((b, i) => {
      const x = 50 + i * (bw + 10);
      const y = doc.y;
      doc.rect(x, y, bw, 60).fill('#f5f0e8').stroke('#e8e0d4');
      doc.fillColor(b.color).fontSize(22).font('Helvetica-Bold').text(String(b.value), x, y + 10, { width: bw, align: 'center' });
      doc.fillColor('#666').fontSize(9).font('Helvetica').text(b.label, x, y + 38, { width: bw, align: 'center' });
    });

    doc.moveDown(5);

    // Secondary stats
    doc.fillColor('#0f0f0f').fontSize(11).font('Helvetica-Bold').text('Performance Summary').moveDown(0.5);
    const secStats = [
      `Avg Resolution Time: ${s.avgRes ? s.avgRes.toFixed(1) + ' hours' : 'N/A'}`,
      `Avg Citizen Rating: ${s.avgRating ? s.avgRating.toFixed(1) + ' / 5 ⭐' : 'No ratings yet'}`,
      `Escalated Complaints: ${s.escalated}`,
    ];
    secStats.forEach(t => {
      doc.fontSize(10).font('Helvetica').fillColor('#444').text(`• ${t}`);
    });

    doc.moveDown(1.5);

    // Complaint list
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f0f0f').text('Complaint Details').moveDown(0.5);

    // Table header
    doc.rect(50, doc.y, W, 22).fill('#0f0f0f');
    const cols = [50, 230, 340, 420, 490];
    const headers = ['Title', 'Status', 'Priority', 'Votes', 'Date'];
    headers.forEach((h, i) => {
      doc.fillColor('#e8820c').fontSize(9).font('Helvetica-Bold')
        .text(h, cols[i] + 4, doc.y - 16, { width: (cols[i+1] || 560) - cols[i] - 8 });
    });
    doc.moveDown(0.3);

    const STATUS_COLORS_PDF = { Resolved: '#22c55e', 'In Progress': '#3b82f6', Overdue: '#ef4444', Escalated: '#a855f7', Pending: '#eab308' };

    complaints.forEach((c, idx) => {
      if (doc.y > 720) doc.addPage();
      const rowY = doc.y;
      const rowBg = idx % 2 === 0 ? '#fafafa' : '#ffffff';
      doc.rect(50, rowY, W, 20).fill(rowBg).stroke('#e8e0d4');

      const color = STATUS_COLORS_PDF[c.status] || '#666';
      doc.fillColor('#0f0f0f').fontSize(8).font('Helvetica')
        .text(c.title.slice(0, 28), cols[0]+4, rowY+6, { width: 176 });
      doc.fillColor(color).font('Helvetica-Bold')
        .text(c.status, cols[1]+4, rowY+6, { width: 100 });
      doc.fillColor('#e8820c').font('Helvetica')
        .text(String(c.priorityScore), cols[2]+4, rowY+6, { width: 76 });
      doc.fillColor('#444')
        .text(String(c.votes), cols[3]+4, rowY+6, { width: 66 });
      doc.fillColor('#888')
        .text(new Date(c.createdAt).toLocaleDateString('en-IN'), cols[4]+4, rowY+6, { width: 70 });
      doc.moveDown(0.55);
    });

    // Footer
    doc.moveDown(2);
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#0f0f0f');
    doc.fillColor('#888').fontSize(9).font('Helvetica')
      .text(`Generated by CivicVoice · ${new Date().toISOString()}`, 50, doc.page.height - 25, { align: 'center', width: W });

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ message: 'PDF generation failed', error: err.message });
  }
};
