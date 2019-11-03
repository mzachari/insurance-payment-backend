const express = require("express");
const router = express.Router();
const farmerController = require('../controllers/farmers');

router.post('/signup', farmerController.createUser);
router.post('/login', farmerController.loginUser);
router.get('', farmerController.getAllFarmers);
router.get('/:farmerId', farmerController.getFarmer);


module.exports = router;

