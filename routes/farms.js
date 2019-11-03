const express = require("express");
const router = express.Router();

const farmsController = require('../controllers/farms');
const checkAuth = require('../middleware/check-auth');
// const extractFile = require('../middleware/file');

router.post('', checkAuth, farmsController.createFarmerFarm);
router.get('', farmsController.getAllFarmerFarms );

router.get('/:farmId', farmsController.getFarmerFarm)
router.put('/:farmid', checkAuth, farmsController.editFarmerFarm );
router.delete('/:farmid', checkAuth, farmsController.deleteFarmerFarm );

module.exports = router;

