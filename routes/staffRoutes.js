const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { uploadImage, updateStaff, createStaff, getStaff, deleteStaff } = require("../controllers/staffControllers");

router.post("/upload/image", uploadImage);

router.post("/create",
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').isLength({ min: 1 }).withMessage('Role is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('image').optional()
  ],
  createStaff
);

router.get("/all", getStaff);

router.delete("/delete/:id",
  [
    param('id').isMongoId().withMessage('Invalid staff ID')
  ],
  deleteStaff
);

router.put("/update/:id",
  [
    param('id').isMongoId().withMessage('Invalid staff ID'),
    body('name').optional().isLength({ min: 1 }).withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').optional().isLength({ min: 1 }).withMessage('Role cannot be empty'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
  ],
  updateStaff
);

module.exports = router;