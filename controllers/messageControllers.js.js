const Messages = require("../models/message");
const { validationResult } = require("express-validator");
// const notifUtil = require('../utils/notificationUtil');



exports.createMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { name, email, phone, role, message } = req.body;

        const newMessage = new Messages({
            name,
            email,
            phone,
            role,
            message,
            isRead: false,
            isArchived: false,
        });

        await newMessage.save();

        // Send notification asynchronously
        // notifUtil.notifyNewMessage(newMessage).catch(err =>
            // logger.error('Failed to send message notification:', err)
        // );

       //  // logger.info(`New message received from: ${name} (${email})`);
        res.status(201).json({
            message: "Message sent successfully",
            messageId: newMessage._id
        });

    } catch (error) {
       //  // logger.error('Message creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getMessages = async (req, res) => {
    try {
        const messages = await Messages.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        if (!messages || messages.length === 0) {
            return res.status(404).json({ message: "No messages found" });
        }

       //  // logger.info(`Retrieved ${messages.length} messages`);
        res.status(200).json(messages);

    } catch (error) {
       //  // logger.error('Get messages error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const message = await Messages.findById(id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        message.isRead = true;
        await message.save();

       //  // logger.info(`Message marked as read: ${id}`);
        res.status(200).json({ message: "Message marked as read" });

    } catch (error) {
       //  // logger.error('Mark as read error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.archiveToggle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const message = await Messages.findById(id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        message.isArchived = !message.isArchived;
        await message.save();

        // Send notification asynchronously
        // notifUtil.notifyResourceUpdated('message', message, `/api/messages`).catch(err =>
           //  // logger.error('Failed to send message archive notification:', err)
        // );

        const status = message.isArchived ? 'archived' : 'unarchived';
       //  // logger.info(`Message ${status}: ${id}`);
        res.status(200).json({
            message: `Message ${status} successfully`,
            isArchived: message.isArchived
        });

    } catch (error) {
       //  // logger.error('Archive toggle error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const message = await Messages.findById(id);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        await Messages.findByIdAndDelete(id);

        // Send notification asynchronously
        // notifUtil.notifyResourceDeleted('message', id).catch(err =>
           //  // logger.error('Failed to send message deletion notification:', err)
        // );

       //  // logger.info(`Message deleted: ${id} from ${message.name}`);
        res.status(200).json({ message: "Message deleted successfully" });

    } catch (error) {
       //  // logger.error('Message deletion error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


exports.replyToMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const { reply } = req.body;

        const message = await Messages.findById(id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        message.reply = {
            reply,
            repliedOn: new Date()
        };

        await message.save();

       //  // logger.info(`Reply added to message: ${id}`);
        res.status(200).json({
            message: "Reply added to message successfully",
            reply: message.reply
        });

    } catch (error) {
       //  // logger.error('Reply to message error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
 
