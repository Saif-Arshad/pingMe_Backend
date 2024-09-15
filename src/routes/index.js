const { Router } = require("express");
const router = Router();
const userRouter = require("./user.routes.ts");

router.use("/users", userRouter);

module.exports = router;

