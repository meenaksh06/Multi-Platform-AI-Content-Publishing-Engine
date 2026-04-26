const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    data: { status: 'healthy' },
    meta: { timestamp: new Date().toISOString() },
    error: null
  });
});

module.exports = app;
