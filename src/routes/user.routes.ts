const express = require("express");
const router = express.Router();
const { createUser, loginUser, checkUserName } = require("../controllers/user.controller");

router.post("/register", createUser);
// router.post("/login", loginUser);
router.post("/checkname", checkUserName);

module.exports = router;

