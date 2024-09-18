const { Router } = require("express");
const router = Router();

const testController = require(".././controllers/test.controller");

router.get("/health", testController.getHealth);
router.get("/version", testController.getVersion);
router.get("/environment", testController.getEnvironment);

module.exports = router;
