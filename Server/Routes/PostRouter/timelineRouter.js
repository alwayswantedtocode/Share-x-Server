const timelineRouter = require("express").Router();
const timelineController = require("../../controllers/PostController/timelineController");

timelineRouter.get("/timeline/:userId", timelineController);

module.exports = timelineRouter;
