const getPostRouter = require("express").Router();
const getPostController = require("../../controllers/PostController/getPostController");

getPostRouter.get("/:id", getPostController);

module.exports = getPostRouter;
