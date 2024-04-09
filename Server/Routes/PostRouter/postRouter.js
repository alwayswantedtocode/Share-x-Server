const registerRouter = require("express").Router();
const postController = require("../../controllers/PostController/postController");

registerRouter.post("/", postController);

module.exports = registerRouter;
