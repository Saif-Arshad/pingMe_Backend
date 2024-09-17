const express = require("express");
const router = express.Router();
const { generateContent } = require('../controllers/ai.controller')

router.post("/", generateContent);

module.exports = router;