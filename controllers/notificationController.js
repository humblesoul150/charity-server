const notifUtil = require('../utils/notificationUtil');
const { validationResult } = require("express-validator");

/**
 * Controller helpers for notifications.  These are very thin wrappers
 * around the utilities so that we can expose a simple REST API if the
 * front-end or other services need to create or query notifications.
 */

exports.createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation errors", errors: errors.array() });
    }

    const { type, title, description, linkTo } = req.body;

    const notification = await notifUtil.createNotification({ type, title, description, linkTo });

    // logger.info(`Notification created: ${notification._id} - ${title}`);
    res.status(201).json(notification);

  } catch (err) {
    // logger.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.seen !== undefined) {
      filter.seen = req.query.seen === 'true';
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.limit) {
      filter.limit = parseInt(req.query.limit, 10);
    }

    const notifications = await notifUtil.getNotifications(filter);

    // logger.info(`Retrieved ${notifications.length} notifications`);
    res.status(200).json(notifications);

  } catch (err) {
    // logger.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation errors", errors: errors.array() });
    }

    const { id } = req.params;
    const updated = await notifUtil.markAsSeen(id);

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // logger.info(`Notification marked as seen: ${id}`);
    res.status(200).json(updated);

  } catch (err) {
    // logger.error('Error marking notification as seen:', err);
  }
};
