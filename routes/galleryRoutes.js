const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createGalleryItem,
  getAllGalleryItems,
  deleteGalleryItem,
  updateGalleryItem,
} = require("../controllers/galleryControllers");
const { requireAuth, requirePermission } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const galleryFields = [
  body().custom((_, { req }) => {
    if (!req.body.imageUrl && !req.body.image?.url) {
      throw new Error("An image URL or uploaded image is required.");
    }
    return true;
  }),
  body("title")
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage("Title must be between 2 and 160 characters."),
  body("category")
    .trim()
    .isIn(["Events", "Education", "Volunteers", "General"])
    .withMessage("Category is invalid."),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be a boolean."),
  body("imageUrl")
    .optional({ values: "falsy" })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image URL must be a valid http or https URL."),
  body("image").optional().isObject().withMessage("Image must be an object."),
  body("image.url")
    .optional({ values: "falsy" })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image URL must be a valid http or https URL."),
  body("image.public_id")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Image public ID is too long."),
];
const galleryId = param("id").isMongoId().withMessage("Invalid gallery ID.");

router.post(
  "/new",
  requireAuth,
  requirePermission("gallery.manage"),
  galleryFields,
  validateRequest,
  createGalleryItem,
);

router.get("/all", getAllGalleryItems);

router.delete(
  "/:id/delete",
  requireAuth,
  requirePermission("gallery.manage"),
  galleryId,
  validateRequest,
  deleteGalleryItem,
);

router.put(
  "/:id/update",
  requireAuth,
  requirePermission("gallery.manage"),
  galleryId,
  galleryFields,
  validateRequest,
  updateGalleryItem,
);
module.exports = router;
