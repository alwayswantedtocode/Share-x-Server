const getUserRouter = require("express").Router();
const getUserController = require("../../controllers/UserController/getUserController");
const { verifyUser } = require("../../utils/Verifytoken");

getUserRouter.get("/", getUserController);

module.exports = getUserRouter;
