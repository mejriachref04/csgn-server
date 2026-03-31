const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const { connectDB } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/swimmers', require('./routes/swimmerRoutes'));
app.use('/api/subscriptions', require('./routes/subRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/planning', require('./routes/planningRoutes'));

app.get('/', (req, res) => res.send('CSGN API running 🏊'));

require('./utils/cronJobs')();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));