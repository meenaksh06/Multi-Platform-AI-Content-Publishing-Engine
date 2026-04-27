const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const dashboardSchema = require('./dashboard.schema');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/metrics', dashboardController.getMetrics);
router.get('/status', validate(dashboardSchema.getStatusList), dashboardController.getStatusList);

module.exports = router;
