const express = require("express");
const router = express.Router();

const farmsController = require('../controllers/farms');
const checkAuth = require('../middleware/check-auth');
// const extractFile = require('../middleware/file');

router.post('', checkAuth, farmsController.createFarmerFarm);
router.get('', checkAuth,farmsController.getAllFarmerFarms );

router.get('/:farmId', checkAuth,farmsController.getFarmerFarm)
router.put('/:farmid', checkAuth, farmsController.editFarmerFarm );
router.delete('/:farmid', checkAuth, farmsController.deleteFarmerFarm );

module.exports = router;

