const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const authSchema = require('./auth.schema');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', validate(authSchema.register), authController.register);
router.post('/login', validate(authSchema.login), authController.login);
router.post('/refresh', validate(authSchema.refresh), authController.refreshTokens);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
