const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { syncMapTo3D } = require('../controllers/floorPlan3DController');

const router = express.Router();

router.use(authenticateToken);
router.post('/sync', syncMapTo3D);

module.exports = router;
