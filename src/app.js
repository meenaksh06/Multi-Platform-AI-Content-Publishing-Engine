const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { AppError } = require('./utils/errors');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const { apiLimiter } = require('./middlewares/rateLimiter');
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    data: { status: 'healthy' },
    meta: { timestamp: new Date().toISOString() },
    error: null
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(404, 'Not found'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;
