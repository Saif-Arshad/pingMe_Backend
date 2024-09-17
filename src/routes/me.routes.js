const express = require("express");
const router = express.Router();
const { me } = require('../controllers/me.controller')

router.post("/", me);

module.exports = router;