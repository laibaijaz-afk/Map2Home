const express = require('express');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  updateCosts,
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getMaterials,
  updateMaterialCost
} = require('../controllers/adminController');
const {
  adminAddMap,
  adminGetAllMaps,
  adminUpdateMap,
  adminDeleteMap
} = require('../controllers/mapController');

const router = express.Router();

// Multer config: save DXF files to the drawings folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const drawingsDir = path.join(__dirname, '..', '..', 'drawings');
    const fs = require('fs');
    if (!fs.existsSync(drawingsDir)) {
      fs.mkdirSync(drawingsDir, { recursive: true });
    }
    cb(null, drawingsDir);
  },
  filename: (req, file, cb) => {
    // Keep original name but prefix with timestamp to avoid collisions
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.dxf')) {
    cb(null, true);
  } else {
    cb(new Error('Only .dxf files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// All admin routes require authentication
router.use(authenticateToken);

// Update cost configuration
router.post('/update-costs', updateCosts);

// Get system statistics
router.get('/stats', getSystemStats);

// Get all users
router.get('/users', getAllUsers);

// Update user role
router.post('/users/:userId/role', updateUserRole);

// Get all materials
router.get('/materials', getMaterials);

// Update material cost
router.put('/materials/cost', updateMaterialCost);

// ── Map management ───────────────────────────
router.get('/maps', adminGetAllMaps);
router.post('/maps', upload.single('dxfFile'), adminAddMap);
router.put('/maps/:id', adminUpdateMap);
router.delete('/maps/:id', adminDeleteMap);

module.exports = router;
