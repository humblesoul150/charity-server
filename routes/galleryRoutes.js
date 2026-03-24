const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createGalleryItem , getAllGalleryItems,deleteGalleryItem
} = require("../controllers/galleryControllers");

router.post("/new",
  createGalleryItem
);

router.get("/all", getAllGalleryItems);

router.delete("/:id/delete",
   
  deleteGalleryItem
);


module.exports = router;