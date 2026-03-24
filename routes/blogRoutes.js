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
  shareToggle
} = require("../controllers/blogControllers");


router.post("/new",
  
  createBlog
);

router.get("/all", getBlogs);

router.get("/:id",
  
  getBlogById
);

router.delete("/delete/:id",
   
  deleteBlog
);

router.put("/:id/update",
  
  updateBlog
);

router.put("/publish/blog/:id",
  
  publishBlog
);

router.post("/:blogId/toggle-like",
  likeToggle
);

router.post("/:blogId/log-share",
   
  shareToggle
);

router.post("/:blogId/log-view",
  
  saveViews
);

module.exports = router;