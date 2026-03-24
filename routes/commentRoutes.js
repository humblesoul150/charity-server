const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createComment, likeToggle, deleteComment } = require("../controllers/commentsController");

router.post("/new",
  
  createComment
);

router.post("/:commentId/toggle-like",
   
  likeToggle
);

router.post("/remove/comment/:id",
  [
    param('id').isMongoId().withMessage('Invalid comment ID')
  ],
  deleteComment
);

module.exports = router;