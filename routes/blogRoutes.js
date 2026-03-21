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


router.post("/create",
  
  createBlog
);

router.get("/all", getBlogs);

router.get("/:id",
  
  getBlogById
);

router.delete("/delete/:id",
   
  deleteBlog
);

router.put("/update/:id",
  
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