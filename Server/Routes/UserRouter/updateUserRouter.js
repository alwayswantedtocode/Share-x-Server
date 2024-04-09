const updateUserRouter = require("express").Router();
const updateUserController = require("../../controllers/UserController/updateUserController")
const {  verifyUser} = require("../../utils/Verifytoken")


updateUserRouter.put("/:id", updateUserController);

module.exports = updateUserRouter;