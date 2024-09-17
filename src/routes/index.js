const { Router } = require("express");
const router = Router();
const userRouter = require("./user.routes.js");
const meRouter = require("./me.routes.js");
router.use("/users", userRouter);
router.use("/me", meRouter)

module.exports = router;

