const express = require("express");
const router = express.Router();
const farmerController = require('../controllers/farmers');
const checkAuth = require('../middleware/check-auth');

router.post('/signup',farmerController.createUser);
router.post('/login',farmerController.loginUser);
router.get('/all', checkAuth,farmerController.getAllFarmersDetails);
router.get('',checkAuth, farmerController.getFarmerDetails);
router.put('',checkAuth,farmerController.editFarmerDetails);


module.exports = router;

