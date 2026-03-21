const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createGalleryItem , getAllGalleryItems
} = require("../controllers/galleryControllers");

router.post("/new",
  createGalleryItem
);

router.get("/all", getAllGalleryItems);


module.exports = router;