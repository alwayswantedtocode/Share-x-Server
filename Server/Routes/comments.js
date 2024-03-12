const router = require("express").Router();
const Comment = require("../Models/CommentSchema");


// create comments
router.post("/:postId/comments", async (req, res) => {
  try {
    const { userId, comments } = req.body;

    const postId = req.params.postId;

    const newcomments = new Comment({
      userId,
      comments,
      postId,
    });

    //save the new comments
    const savedComments = await newcomments.save();

    res.status(200).json(savedComments);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
