const deleteUserRouter = require("express").Router();
const deleteUserController = require("../../controllers/UserController/deleteUserController");
const { verifyUser } = require("../../utils/Verifytoken");

deleteUserRouter.delete("/:id", verifyUser, deleteUserController);

module.exports = deleteUserRouter;
