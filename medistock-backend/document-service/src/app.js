const express = require('express');
const cors = require('cors');
const path = require('path');
const documentRoutes = require('./routes/document.routes');
const { uploadDir } = require('./middlewares/upload.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(uploadDir)));
app.use('/documents', documentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'UP' });
});

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || 'Erreur serveur' });
});

module.exports = app;
