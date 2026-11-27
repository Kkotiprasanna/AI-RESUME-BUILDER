const mongoose = require('mongoose');
const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'My Resume' },
  template: { type: String, enum: ['modern', 'classic'], default: 'modern' },
  personal: {
    fullName: String, email: String, phone: String, location: String,
    linkedin: String, website: String, role: String
  },
  summary: String,
  education: [{ school: String, degree: String, year: String, details: String }],
  experience: [{ company: String, role: String, duration: String, description: String }],
  skills: [String],
  projects: [{ name: String, description: String, link: String }]
}, { timestamps: true });
module.exports = mongoose.model('Resume', resumeSchema);
