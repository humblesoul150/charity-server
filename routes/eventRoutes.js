const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createEvent,
  getEventById,
  getEvents,
  deleteEvent,
  updateEvent,
  shareToggle,
  saveViews,
} = require("../controllers/eventControllers");
const { requireAuth, requirePermission } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");

const eventFields = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Title must be between 2 and 120 characters."),
  body("topic")
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage("Topic must be between 2 and 160 characters."),
  body("date").isISO8601().withMessage("Date must be a valid date."),
  body("time")
    .trim()
    .isLength({ max: 30 })
    .withMessage("Time must be 30 characters or fewer."),
  body("location")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Location must be between 2 and 200 characters."),
  body("category")
    .trim()
    .isIn(["Community", "Education", "Volunteer", "General"])
    .withMessage("Category is invalid."),
  body("description")
    .trim()
    .isLength({ min: 2, max: 5000 })
    .withMessage("Description must be between 2 and 5,000 characters."),
  body("status")
    .optional()
    .isIn(["upcoming", "past"])
    .withMessage("Status is invalid."),
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

const eventId = param("id").isMongoId().withMessage("Invalid event ID.");

router.post(
  "/new",
  requireAuth,
  requirePermission("events.manage"),
  eventFields,
  validateRequest,
  createEvent,
);

router.get("/all", getEvents);

router.get(
  "/:id",

  getEventById,
);

router.delete(
  "/delete/:id",
  requireAuth,
  requirePermission("events.manage"),
  eventId,
  validateRequest,
  deleteEvent,
);

router.put(
  "/:id/update",
  requireAuth,
  requirePermission("events.manage"),
  eventId,
  eventFields,
  validateRequest,
  updateEvent,
);

router.post(
  "/:eventId/log-share",

  shareToggle,
);

router.post(
  "/:eventId/log-view",

  saveViews,
);

module.exports = router;
