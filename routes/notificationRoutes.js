const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { body, param, query } = require('express-validator');

// POST /notifications        -> create a new notification
router.post('/', [
  body('type').isString().notEmpty().withMessage('Type is required'),
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('linkTo').optional().isString().withMessage('LinkTo must be a string')
], controller.createNotification);

// GET /notifications         -> list notifications (optional filters via query)
router.get('/', [
  query('seen').optional().isBoolean().withMessage('Seen must be a boolean'),
  query('type').optional().isString().withMessage('Type must be a string'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer')
], controller.getNotifications);

// PATCH /notifications/:id/seen -> mark a notification as seen
router.patch('/:id/seen', [
  param('id').isMongoId().withMessage('Invalid notification ID')
], controller.markAsSeen);

module.exports = router;
