const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./src/routes/auth.routes');
dotenv.config();
app.use(cors());


const prisma = new PrismaClient();
const PORT = process.env.PORT || 7777;

app.use(express.json());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CubeSolver Backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
