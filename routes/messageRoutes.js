const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createMessage, getMessages, markAsRead, archiveToggle, deleteMessage, replyToMessage } = require('../controllers/messageControllers.js');

router.post("/volunteers/create",
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('role').optional().isLength({ min: 1 }).withMessage('Role must be valid'),
    body('message').isLength({ min: 1 }).withMessage('Message is required')
  ],
  createMessage
);

router.get("/all", getMessages);

router.post("/:id/mark-read",
  [
    param('id').isMongoId().withMessage('Invalid message ID')
  ],
  markAsRead
);

router.post("/:id/toggle-archive",
  [
    param('id').isMongoId().withMessage('Invalid message ID')
  ],
  archiveToggle
);

router.delete("/:id/delete",
  [
    param('id').isMongoId().withMessage('Invalid message ID')
  ],
  deleteMessage
);

router.post("/:id/reply",
  [
    param('id').isMongoId().withMessage('Invalid message ID'),
    body('reply').isLength({ min: 1 }).withMessage('Reply is required')
  ],
  replyToMessage
);

module.exports = router;