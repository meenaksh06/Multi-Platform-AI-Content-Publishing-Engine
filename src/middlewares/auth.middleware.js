const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const config = require('../config');
const prisma = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new AppError(401, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
