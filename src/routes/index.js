const { Router } = require("express");
const router = Router();
const { verifyUserToken } = require('../middlewares/jwt.js')
const userRouter = require("./user.routes.js");
const meRouter = require("./me.routes.js");
const aiRouter = require("./ai.routes");
router.use("/users", userRouter);
router.use("/me", meRouter)
router.use("/ai", verifyUserToken, aiRouter);

module.exports = router;

