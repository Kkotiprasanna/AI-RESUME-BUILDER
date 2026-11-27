const router = require('express').Router();
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/', async (req, res) => {
  try { res.json(await Resume.find({ user: req.userId }).sort({ updatedAt: -1 })); }
  catch { res.status(500).json({ message: 'Could not load resumes' }); }
});
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body, user: req.userId };
    delete data._id;
    const resume = await Resume.create(data);
    res.status(201).json(resume);
  } catch (e) { res.status(400).json({ message: 'Could not save resume', detail: e.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch { res.status(400).json({ message: 'Invalid resume ID' }); }
});
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id; delete data.user;
    const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, { new: true, runValidators: true });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (e) { res.status(400).json({ message: 'Could not update resume', detail: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await Resume.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted' });
  } catch { res.status(400).json({ message: 'Could not delete resume' }); }
});
module.exports = router;
