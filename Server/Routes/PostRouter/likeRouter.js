const likeRouter = require("express").Router();
const likeController = require("../../controllers/PostController/likeController");

likeRouter.put("/:id/like", likeController);

module.exports = likeRouter;
