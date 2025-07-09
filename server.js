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

// ✅ Static files (should be below logger and above routes)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://TestDB:Test1234@cluster0.b3aldmx.mongodb.net/student-collab-hub?retryWrites=true&w=majority&appName=student-collab-hub')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Test Route
app.get('/test', (req, res) => {
  console.log('✅ /test route hit');
  res.send('Test successful');
});

// ✅ Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();

  res.status(201).json({ message: 'Registered successfully' });
});

// ✅ Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const match = user && await bcrypt.compare(password, user.password);

  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  res.status(200).json({ message: 'Login successful' });
});

// ✅ Post Project
app.post('/projects', async (req, res) => {
  const { title, description, email, lookingFor } = req.body;
  if (!title || !description || !email) return res.status(400).json({ message: 'All fields required' });

  const project = new Project({ title, description, email, lookingFor });
  await project.save();
  res.status(201).json({ message: 'Project posted' });
});

// ✅ Get All Projects
app.get('/projects', async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// ✅ Post Job
app.post('/jobs', async (req, res) => {
  const { title, company, role, description, email } = req.body;
  if (!title || !company || !role || !description || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const job = new Job({ title, company, role, description, email });
  await job.save();
  res.status(201).json({ message: 'Job posted successfully' });
});

// ✅ Get All Jobs
app.get('/jobs', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
