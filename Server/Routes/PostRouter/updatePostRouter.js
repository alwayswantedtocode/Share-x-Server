const updatepostRouter = require("express").Router();
const UpdatePostController = require("../../controllers/PostController/UpdatePostController");

updatepostRouter.put("/:id", UpdatePostController);

module.exports = updatepostRouter;
