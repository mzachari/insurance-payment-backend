const express = require("express");
const router = express.Router();
const cropController = require('../controllers/crops');

router.get('', cropController.getAllCrops);
router.post('',cropController.addCrop);

module.exports = router;