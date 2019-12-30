const express = require("express");
const router = express.Router();

const policyController = require('../controllers/insurancePlan');
const checkAuth = require('../middleware/check-auth');
// const extractFile = require('../middleware/file');

router.post('', checkAuth, policyController.createProviderPolicy);
router.get('', checkAuth,policyController.getAllProviderPolicy );
router.get('/all', policyController.getAllPolicy);

module.exports = router;

