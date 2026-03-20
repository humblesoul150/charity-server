const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createComment, likeToggle, deleteComment } = require("../controllers/commentsController");

router.post("/new",
  [
    body('type').isIn(['visit', 'blog']).withMessage('Type must be visit or blog'),
    body('typeId').isMongoId().withMessage('Invalid typeId'),
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('comment').isLength({ min: 1 }).withMessage('Comment is required'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  createComment
);

router.post("/:commentId/toggle-like",
  [
    param('commentId').isMongoId().withMessage('Invalid comment ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  likeToggle
);

router.post("/remove/comment/:id",
  [
    param('id').isMongoId().withMessage('Invalid comment ID')
  ],
  deleteComment
);

module.exports = router;