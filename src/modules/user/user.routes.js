const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const userSchema = require('./user.schema');
const userController = require('./user.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/me', userController.getProfile);
router.post('/social', validate(userSchema.addSocialAccount), userController.addSocialAccount);
router.delete('/social/:platform', validate(userSchema.removeSocialAccount), userController.removeSocialAccount);

module.exports = router;
