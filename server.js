const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.resolve(__dirname, 'public'))); // Serve static files
app.use(session({
  secret: 'sua-chave-secreta', // pode ser qualquer frase secreta
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes
app.use('/api/cars', require('./routes/cars'));
app.use('/api/admin', require('./routes/admin'));

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.get('/cars', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'cars.html'));
});

app.get('/car/:id', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'car-details.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'admin.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'admin-dashboard.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});