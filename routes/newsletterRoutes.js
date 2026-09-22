const express = require('express');
const { requireAuth, requirePermission } = require('../middleware/auth');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterSubscribers,
  verifyNewsletterSubscription,
  resendNewsletterVerification,
} = require('../controllers/newsletterController');

router.get('/subscribers', requireAuth, requirePermission('newsletter.view'), getNewsletterSubscribers);

router.get('/verify/:token', verifyNewsletterSubscription);

router.post(
  '/subscribe',
  [
    body('email').isEmail().withMessage('A valid email is required.'),
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters if provided.'),
  ],
  subscribeToNewsletter,
);

router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('A valid email is required.'),
  ],
  resendNewsletterVerification,
);

router.post(
  '/unsubscribe/:token',
  [
    param('token').isHexadecimal().isLength({ min: 48, max: 48 }).withMessage('A valid unsubscribe token is required.'),
  ],
  unsubscribeFromNewsletter,
);

module.exports = router;
