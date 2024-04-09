const deletePostRouter = require("express").Router();
const DeletePostController = require("../../controllers/PostController/deletePostController");

deletePostRouter.delete("/:id", DeletePostController);

module.exports = deletePostRouter;
