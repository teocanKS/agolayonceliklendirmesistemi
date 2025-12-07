const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/events', eventController.getEvents);
router.get('/stats', eventController.getStats);
router.get('/strategic-insights', eventController.getStrategicInsights);

module.exports = router;

