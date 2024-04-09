const userpostRoute = require("express").Router();
const userpostController = require("../../controllers/PostController/UsersPostController");

userpostRoute.get("/profile/:username", userpostController);

module.exports = userpostRoute;
