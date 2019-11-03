const express = require("express");
const router = express.Router();
const farmerController = require('../controllers/farmers');
const checkAuth = require('../middleware/check-auth');

router.post('/signup',farmerController.createUser);
router.post('/login',farmerController.loginUser);
router.get('', checkAuth,farmerController.getAllFarmersDetails);
router.get('/:farmerId',checkAuth, farmerController.getFarmerDetails);
router.put('/:farmerId',checkAuth,farmerController.editFarmerDetails);


module.exports = router;

