const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createVisit,
  getVisitById,
  getVisits,
  deleteVisit,
  uploadImage,
  addParticipant,
  addImage,
  removeImage,
  removeParticipant,
  updateVisit,
  toggleFeatured,
  likeToggle,
  shareToggle,
  saveViews
} = require("../controllers/visitsControllers");

router.post("/upload/image", uploadImage);

router.post("/create",
  [
    body('title').isLength({ min: 1 }).withMessage('Title is required'),
    body('community').isLength({ min: 1 }).withMessage('Community is required'),
    body('country').isLength({ min: 1 }).withMessage('Country is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('content').isLength({ min: 1 }).withMessage('Content is required'),
    body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
    body('videoId').optional().isLength({ min: 1 }).withMessage('Video ID must be valid'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    body('participants').optional().isArray().withMessage('Participants must be an array'),
    body('gallery').optional().isArray().withMessage('Gallery must be an array'),
    body('location').optional()
  ],
  createVisit
);

router.post("/add/participant/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID'),
    body('name').isLength({ min: 1 }).withMessage('Participant name is required'),
    body('role').optional().isLength({ min: 1 }).withMessage('Role must be valid')
  ],
  addParticipant
);

router.post("/add/gallery/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID'),
    body('image').exists().withMessage('Image data is required')
  ],
  addImage
);

router.get("/all", getVisits);

router.get("/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID')
  ],
  getVisitById
);

router.delete("/delete/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID')
  ],
  deleteVisit
);

router.post("/remove/participant/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID'),
    body('participantId').isMongoId().withMessage('Invalid participant ID')
  ],
  removeParticipant
);

router.post("/remove/image/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID'),
    body('galleryId').isMongoId().withMessage('Invalid gallery ID')
  ],
  removeImage
);

router.post("/featured/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID')
  ],
  toggleFeatured
);

router.put("/update/:id",
  [
    param('id').isMongoId().withMessage('Invalid visit ID'),
    body('title').optional().isLength({ min: 1 }).withMessage('Title cannot be empty'),
    body('community').optional().isLength({ min: 1 }).withMessage('Community cannot be empty'),
    body('country').optional().isLength({ min: 1 }).withMessage('Country cannot be empty'),
    body('content').optional().isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
  ],
  updateVisit
);

router.post("/:visitId/toggle-like",
  [
    param('visitId').isMongoId().withMessage('Invalid visit ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  likeToggle
);

router.post("/:visitId/log-share",
  [
    param('visitId').isMongoId().withMessage('Invalid visit ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  shareToggle
);

router.post("/:visitId/log-view",
  [
    param('visitId').isMongoId().withMessage('Invalid visit ID'),
    body('uuid').isLength({ min: 1 }).withMessage('UUID is required')
  ],
  saveViews
);

module.exports = router;