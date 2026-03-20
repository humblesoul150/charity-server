const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createBlog,
  getBlogById,
  getBlogs,
  deleteBlog,
  updateBlog,
  uploadImage,
  publishBlog,
  likeToggle,
  saveViews,
  shareToggle
} = require("../controllers/blogControllers");

router.post("/upload/image", uploadImage);

router.post("/create",
  [
    body('title').isLength({ min: 1 }).withMessage('Title is required'),
    body('content').isLength({ min: 1 }).withMessage('Content is required'),
    body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
    body('author').isLength({ min: 1 }).withMessage('Author is required'),
    body('videoId').optional().isLength({ min: 1 }).withMessage('Video ID must be valid'),
    body('thumbnail').optional()
  ],
  createBlog
);

router.get("/all", getBlogs);

router.get("/:id",
  [
    param('id').isMongoId().withMessage('Invalid blog ID')
  ],
  getBlogById
);

router.delete("/delete/:id",
  [
    param('id').isMongoId().withMessage('Invalid blog ID')
  ],
  deleteBlog
);

router.put("/update/:id",
  [
    param('id').isMongoId().withMessage('Invalid blog ID'),
    body('title').optional().isLength({ min: 1 }).withMessage('Title cannot be empty'),
    body('content').optional().isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
    body('author').optional().isLength({ min: 1 }).withMessage('Author cannot be empty')
  ],
  updateBlog
);

router.put("/publish/blog/:id",
  [
    param('id').isMongoId().withMessage('Invalid blog ID')
  ],
  publishBlog
);

router.post("/:blogId/toggle-like",
  [
    param('blogId').isMongoId().withMessage('Invalid blog ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  likeToggle
);

router.post("/:blogId/log-share",
  [
    param('blogId').isMongoId().withMessage('Invalid blog ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  shareToggle
);

router.post("/:blogId/log-view",
  [
    param('blogId').isMongoId().withMessage('Invalid blog ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  saveViews
);

module.exports = router;