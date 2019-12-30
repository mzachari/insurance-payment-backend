const express = require("express");
const router = express.Router();
const insuranceProviderController = require('../controllers/insuranceProvider');
const checkAuth = require('../middleware/check-auth');

router.post('/signup',insuranceProviderController.createUser);
router.post('/login',insuranceProviderController.loginUser);
router.get('/all', checkAuth,insuranceProviderController.getAllInsuranceProviderDetails);
router.get('',checkAuth, insuranceProviderController.getInsuranceProviderDetails);
router.put('',checkAuth,insuranceProviderController.editInsuranceProviderDetails);


module.exports = router;

