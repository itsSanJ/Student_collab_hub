const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const User = require('./models/User');
const Project = require('./models/project');
const Job = require('./models/job');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Log every request
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Health Check
app.get('/test', (req, res) => {
  res.send('✅ Server & DB are running.');
});

// ✅ Auth Routes
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();

  res.status(201).json({ message: 'Registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const match = user && await bcrypt.compare(password, user.password);

  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  res.status(200).json({ message: 'Login successful' });
});

// ✅ Project Routes
app.post('/projects', async (req, res) => {
  const { title, description, email, lookingFor } = req.body;
  if (!title || !description || !email)
    return res.status(400).json({ message: 'All fields required' });

  const project = new Project({ title, description, email, lookingFor });
  await project.save();
  res.status(201).json({ message: 'Project posted' });
});

app.get('/projects', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// ✅ Job Routes
app.post('/jobs', async (req, res) => {
  const { title, company, role, description, email } = req.body;
  if (!title || !company || !role || !description || !email)
    return res.status(400).json({ message: 'All fields are required' });

  const job = new Job({ title, company, role, description, email });
  await job.save();
  res.status(201).json({ message: 'Job posted successfully' });
});

app.get('/jobs', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// ✅ Catch-all route for SPA (serves index.html)
// Health check
app.get('/test', (req, res) => {
  res.json({ message: 'Backend working!' });
});

// ALWAYS LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/test', (req, res) => {
  res.json({ message: 'Backend working!' });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
