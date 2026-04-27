const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const postRoutes = require('../modules/post/post.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
