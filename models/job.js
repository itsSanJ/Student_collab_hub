const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  role: String,
  description: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
