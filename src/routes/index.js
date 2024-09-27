const { Router } = require("express");
const router = Router();
const { verifyUserToken } = require('../middlewares/jwt.js')
const userRouter = require("./user.routes.js");
const meRouter = require("./me.routes.js");
const testRuleRouter = require("./test.routes.js");
router.use("/users", userRouter);
router.use("/me", meRouter)
router.use("/test", testRuleRouter);

module.exports = router;

