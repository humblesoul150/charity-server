const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createBlog,
  getBlogById,
  getBlogs,
  deleteBlog,
  updateBlog,
  publishBlog,
  likeToggle,
  saveViews,
  shareToggle,
  toggledFetaured,
} = require("../controllers/blogControllers");
const { requireAuth, requirePermission } = require("../middleware/auth");

router.post("/new", requireAuth, requirePermission("blogs.manage"), createBlog);

router.get("/all", getBlogs);

router.get(
  "/:id",

  getBlogById,
);

router.delete(
  "/delete/:id",
  requireAuth,
  requirePermission("blogs.manage"),
  deleteBlog,
);

router.put(
  "/:id/update",
  requireAuth,
  requirePermission("blogs.manage"),
  updateBlog,
);

router.put(
  "/publish/blog/:id",
  requireAuth,
  requirePermission("blogs.manage"),
  publishBlog,
);

router.post("/:blogId/toggle-like", likeToggle);

router.post(
  "/:blogId/log-share",

  shareToggle,
);

router.post(
  "/:blogId/log-view",

  saveViews,
);

router.put(
  "/:id/toggle-featured",
  requireAuth,
  requirePermission("blogs.manage"),
  toggledFetaured,
);

module.exports = router;
