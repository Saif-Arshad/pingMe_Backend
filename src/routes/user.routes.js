const express = require("express");
const router = express.Router();
const { verifyUserToken } = require("../middlewares/jwt")
const { createUser, loginUser, checkUserName, signAdminOut } = require("../controllers/user.controller");
router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/checkname", checkUserName);
router.post("/log-out", verifyUserToken, signAdminOut);

module.exports = router;

