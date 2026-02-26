const https = require('https');

const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Sanitation & Waste',
  'Street Lighting',
  'Water Supply',
  'Parks & Gardens',
  'General',
];

// POST /api/ai/categorize
exports.categorize = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description)
      return res.status(400).json({ message: 'Title or description required' });

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback: simple keyword-based if no API key
      return res.json(keywordFallback(title + ' ' + description));
    }

    const prompt = `You are a municipal complaint classification system for an Indian city.

Given the following civic complaint, respond with ONLY a JSON object (no markdown, no explanation):
{
  "department": "<one of: Roads & Infrastructure | Sanitation & Waste | Street Lighting | Water Supply | Parks & Gardens | General>",
  "severity": <integer 1-10, where 10 is most severe>,
  "emergency": <true|false>,
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "<one sentence summary under 80 chars>",
  "suggestedTitle": "<improved complaint title under 100 chars>"
}

Complaint Title: ${title || ''}
Complaint Description: ${description || ''}

Rules:
- emergency=true only for immediate safety hazards (flooding, open manhole, live wire, fire)
- severity 8-10: safety hazard / major disruption
- severity 5-7: significant issue affecting many citizens
- severity 1-4: minor inconvenience
- tags should be 2-4 single-word hashtag-style labels (no # symbol)`;

    const body = JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages:   [{ role: 'user', content: prompt }],
    });

    const result = await callAnthropic(body);
    const text   = result.content?.[0]?.text || '';

    // Strip markdown fences if present
    const clean  = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Validate department
    if (!DEPARTMENTS.includes(parsed.department)) parsed.department = 'General';

    res.json(parsed);
  } catch (err) {
    console.error('AI categorize error:', err.message);
    // Always return a safe fallback
    res.json(keywordFallback((req.body.title || '') + ' ' + (req.body.description || '')));
  }
};

// Simple keyword fallback (no API key needed)
function keywordFallback(text) {
  const t = text.toLowerCase();
  let department = 'General';
  if (/pothole|road|footpath|pavement|bridge|traffic/.test(t))    department = 'Roads & Infrastructure';
  else if (/garbage|waste|trash|dustbin|sanit|sewage/.test(t))    department = 'Sanitation & Waste';
  else if (/light|lamp|street.*light|dark|bulb/.test(t))          department = 'Street Lighting';
  else if (/water|pipe|supply|leakage|flood/.test(t))             department = 'Water Supply';
  else if (/park|garden|tree|grass|playground/.test(t))           department = 'Parks & Gardens';
  const emergency = /emergency|danger|hazard|accident|injur|fire|electric|wire/.test(t);
  const severity  = emergency ? 8 : 4;
  return { department, severity, emergency, tags: [], summary: '', suggestedTitle: '' };
}

function callAnthropic(body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (r) => {
      let data = '';
      r.on('data', (chunk) => (data += chunk));
      r.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
