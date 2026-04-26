const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const { AppError } = require('../../utils/errors');
const config = require('../../config');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ sub: userId }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiration,
  });

  const refreshToken = jwt.sign({ sub: userId }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiration,
  });

  return { accessToken, refreshToken };
};

const register = async (email, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(400, 'Email already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  const tokens = generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError(401, 'Incorrect email or password');
  }

  const tokens = generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
};

const refreshTokens = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || user.refreshToken !== token) {
      throw new Error();
    }

    const tokens = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return { tokens };
  } catch (error) {
    throw new AppError(401, 'Please authenticate');
  }
};

const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout
};
