require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Node.js backend is running.' });
});

// Import routes
const authRoutes = require('./routes/auth');

// Route Middlewares
app.use('/', authRoutes); // Use auth routes at the root level

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const pdfRoutes = require('./routes/pdf');

// Route Middlewares
app.use('/', authRoutes);
app.use('/', studentRoutes);
app.use('/', userRoutes);
app.use('/', schoolRoutes);
app.use('/', pdfRoutes);

app.listen(port, () => {
  console.log(`Node.js server listening at http://localhost:${port}`);
});
