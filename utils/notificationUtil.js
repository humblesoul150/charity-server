const Notification = require('../models/notification');

/**
 * A small helper / utility for working with the Notification model.
 *
 * This module exposes a thin wrapper around Mongoose operations so that
 * the rest of the application doesn't need to import the model directly
 * every time a notification needs to be created or manipulated.  It also
 * centralises any future business logic (e.g. pushing a socket event) in
 * one place.
 */

/**
 * Create a new notification document.
 *
 * @param {Object} opts
 * @param {string} opts.type     one of the allowed enum values
 * @param {string} opts.title    short human readable title
 * @param {string} opts.description  detailed description/message
 * @param {string} [opts.linkTo]     optional URL / route to associate
 * @returns {Promise<Notification>} the saved notification instance
 */
async function createNotification({ type, title, description, linkTo }) {
  const notification = new Notification({ type, title, description, linkTo });
  await notification.save();
  return notification;
}

// convenience wrappers for the most common notification flows

/**
 * Create a standard "new message" notification from a message document.
 *
 * @param {Object} msg document from the Messages collection
 * @returns {Promise<Notification>}
 */
function notifyNewMessage(msg) {
  if (!msg || !msg._id) {
    throw new Error('message document required to generate notification');
  }

  return createNotification({
    type: 'message',
    title: 'New message',
    description: `You have received a new message from ${msg.name}`,
    linkTo: `/admin/messages`,
  });
}

/**
 * Generate a generic system notification.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} [linkTo]
 */
function notifySystem(title, description, linkTo) {
  return createNotification({ type: 'system', title, description, linkTo });
}

// helpers for standard resource lifecycle events

/**
 * Notify that a resource has been created.
 *
 * @param {string} resourceName human readable (e.g. "blog", "visit")
 * @param {Object} doc optional document containing _id or other info
 * @param {string} [linkTo] optional route to attach
 */
function notifyResourceCreated(resourceName, doc = {}, linkTo) {
  const desc = `A new ${resourceName} was created${doc ? `" ${doc.name || doc.title}"` : ''}`;
  return createNotification({ type: 'system', title: `${capitalize(resourceName)} created`, description: desc, linkTo });
}

/**
 * Notify that a resource has been updated.
 */
function notifyResourceUpdated(resourceName, doc = {}, linkTo) {
  const desc = `An existing ${resourceName} was updated${doc._id ? ` (id: ${doc._id})` : ''}`;
  return createNotification({ type: 'system', title: `${capitalize(resourceName)} updated`, description: desc, linkTo });
}

/**
 * Notify that a resource has been deleted.
 */
function notifyResourceDeleted(resourceName, id, linkTo) {
  const desc = `A ${resourceName} was deleted${id ? ` (id: ${id})` : ''}`;
  return createNotification({ type: 'system', title: `${capitalize(resourceName)} deleted`, description: desc, linkTo });
}

/**
 * Convenience for new comment notifications.
 */
function notifyNewComment(comment,linkTo) {
  if (!comment) throw new Error('comment required');
  return createNotification({
    type: 'comment',
    title: 'New comment',
    description: `A new comment was posted${comment.type ? ` on ${comment.type}` : ''}`,
    linkTo: linkTo || '#' ,
  });
}

// simple internal helper
function capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Mark a single notification as seen/cleared.
 *
 * @param {string|ObjectId} id
 * @returns {Promise<Notification|null>} updated document or null if not found
 */
function markAsSeen(id) {
  return Notification.findByIdAndUpdate(id, { seen: true }, { new: true });
}

/**
 * Retrieve notifications matching optional filters.
 *
 * @param {Object} [filter]
 * @param {boolean} [filter.seen]
 * @param {string} [filter.type]
 * @param {number} [filter.limit]
 * @returns {Promise<Notification[]>}
 */
function getNotifications(filter = {}) {
  const query = Notification.find();

  if (filter.seen !== undefined) {
    query.where('seen').equals(!!filter.seen);
  }

  if (filter.type) {
    query.where('type').equals(filter.type);
  }

  if (filter.limit) {
    query.limit(filter.limit);
  }

  return query.sort('-createdAt').exec();
}

/**
 * Remove all notifications (useful for tests or administrative scripts).
 *
 * @returns {Promise<{ deletedCount: number }>}
 */
function clearAll() {
  return Notification.deleteMany({});
}

module.exports = {
  createNotification,
  markAsSeen,
  getNotifications,
  clearAll,
  notifyNewMessage,
  notifySystem,
  notifyResourceCreated,
  notifyResourceUpdated,
  notifyResourceDeleted,
  notifyNewComment,
};
