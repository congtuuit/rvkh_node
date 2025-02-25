const express = require("express");
const { getVideoEmbed, proxyVideo } = require('../services/video');

const router = express.Router();

router.get('/embed/:id', getVideoEmbed);
router.get('/proxy', proxyVideo);

module.exports = router;
