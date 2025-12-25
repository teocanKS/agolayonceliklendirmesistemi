const router = require('express').Router();
const { getEvents, getStats, getStrategicInsights, getLongTermStats } = require("../controllers/controller");

router.get('/events', getEvents);
router.get('/stats', getStats);
router.get('/strategic-insights', getStrategicInsights);
router.get('/long-term-stats', getLongTermStats);

module.exports = router;
