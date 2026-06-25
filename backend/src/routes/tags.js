const express = require('express');
const uploadController = require('../controllers/uploadController');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(uploadController.listarTags));

module.exports = router;
