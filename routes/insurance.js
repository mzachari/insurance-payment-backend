const express = require("express");
const router = express.Router();

const insuranceController = require('../controllers/insurance');
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

router.post('',checkAuth,extractFile, insuranceController.createFarmerInsurance);
router.get('', checkAuth,insuranceController.getAllFarmerInsurances );

// router.get('/:farmId', checkAuth,farmsController.getFarmerFarm)
// router.put('/:farmid', checkAuth, farmsController.editFarmerFarm );
// router.delete('/:farmid', checkAuth, farmsController.deleteFarmerFarm );

module.exports = router; 
