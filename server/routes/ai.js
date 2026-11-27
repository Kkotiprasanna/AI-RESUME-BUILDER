const router = require('express').Router();
const auth = require('../middleware/auth');
router.use(auth);

// If no Gemini key is configured, return a useful local fallback so the feature remains demoable.
router.post('/improve', async (req, res) => {
  const { text, type = 'summary', role = '' } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Enter some text first' });
  const prompt = type === 'summary'
    ? `Write a concise, professional resume summary for a ${role || 'job'} candidate using these facts. Do not invent facts. Return only the summary:\n${text}`
    : `Rewrite this resume experience/project description with strong action verbs and clear impact. Do not invent metrics or facts. Return 2-3 concise bullet points:\n${text}`;

  if (!process.env.GEMINI_API_KEY) {
    const cleaned = text.trim().replace(/\s+/g, ' ');
    const improved = type === 'summary'
      ? `Motivated ${role || 'professional'} with a foundation in ${cleaned}. Eager to apply practical skills, contribute to team goals, and continue developing professionally.`
      : `• Developed and contributed to ${cleaned}.\n• Applied relevant skills to complete tasks and improve the overall outcome.`;
    return res.json({ text: improved, mode: 'demo-fallback', note: 'Add GEMINI_API_KEY to .env to enable live AI generation.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ message: data.error?.message || 'AI provider request failed' });
    const result = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim();
    if (!result) return res.status(502).json({ message: 'AI returned an empty response' });
    res.json({ text: result, mode: 'gemini' });
  } catch { res.status(502).json({ message: 'Could not connect to AI provider' }); }
});
module.exports = router;
