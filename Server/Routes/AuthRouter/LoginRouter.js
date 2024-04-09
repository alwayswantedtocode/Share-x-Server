const loginRouter = require("express").Router();
const loginController = require("../../controllers/AuthController/loginController");

loginRouter.post("/signin", loginController);

module.exports = loginRouter;
