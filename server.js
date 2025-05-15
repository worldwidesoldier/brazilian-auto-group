const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Conectar ao MongoDB
connectDB();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Necessário para permitir upload de arquivos
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'sua-chave-secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Servir arquivos estáticos
app.use(express.static(path.resolve(__dirname, 'public')));

// Rotas da API
app.use('/api/cars', require('./routes/cars'));
app.use('/api/admin', require('./routes/admin'));

// Rotas do frontend
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
    res.redirect('/admin-dashboard.html');
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'admin-dashboard.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});