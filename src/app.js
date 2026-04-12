const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes.js');
const accountRoutes = require('./routes/account.routes.js');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bienvenido a Wallet Sandbox');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente'
  });
});

app.use('/auth', authRoutes);
app.use('/account', accountRoutes);

module.exports = app;
