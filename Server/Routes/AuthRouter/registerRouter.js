const registerRouter = require("express").Router();
const registerController = require("../../controllers/AuthController/registercontroller");

registerRouter.post("/register", registerController);

module.exports = registerRouter;
