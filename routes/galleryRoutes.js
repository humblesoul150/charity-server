const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createGalleryItem , getAllGalleryItems,deleteGalleryItem,updateGalleryItem
} = require("../controllers/galleryControllers");

router.post("/new",
  createGalleryItem
);

router.get("/all", getAllGalleryItems);

router.delete("/:id/delete",


   
  deleteGalleryItem
);

router.put("/:id/update",
  updateGalleryItem
);
module.exports = router;