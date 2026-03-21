const Comments = require("../models/comment");
const Visits = require("../models/event");
const Blogs = require("../models/blog");
const { validationResult } = require("express-validator");
// const notifUtil = require('../utils/notificationUtil');

exports.createComment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { type, typeId, name, phone, comment, uuid } = req.body;

        const newComment = new Comments({
            type,
            typeId,
            name,
            phone: phone || '',
            comment,
            userId: uuid,
            likes: [],
        });
        await newComment.save();

        let linkTo;
        if (type === 'visit') {
            const findVisit = await Visits.findById(typeId);
            if (!findVisit) {
                await Comments.findByIdAndDelete(newComment._id); // Cleanup
                return res.status(404).json({ message: "Visit not found" });
            }
            findVisit.comments.push(newComment._id);
            await findVisit.save();
            linkTo = `/api/visits/${typeId}`;
        } else if (type === 'blog') {
            const findBlog = await Blogs.findById(typeId);
            if (!findBlog) {
                await Comments.findByIdAndDelete(newComment._id); // Cleanup
                return res.status(404).json({ message: "Blog not found" });
            }
            findBlog.comments.push(newComment._id);
            await findBlog.save();
            linkTo = `/api/blogs/${typeId}`;
        } else {
            await Comments.findByIdAndDelete(newComment._id); // Cleanup
            return res.status(400).json({ message: "Invalid comment type" });
        }

        // Send notification asynchronously
        // notifUtil.notifyNewComment(newComment, linkTo).catch(err =>
            // logger.error('Failed to send comment notification:', err)
        // );

        logger.info(`New comment created: ${newComment._id} on ${type} ${typeId}`);
        res.status(201).json({
            message: "Comment created successfully",
            comment: {
                id: newComment._id,
                type: newComment.type,
                typeId: newComment.typeId
            }
        });

    } catch (error) {
        logger.error('Comment creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.likeToggle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { commentId } = req.params;
        const { uuid } = req.body;

        const comment = await Comments.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const linkTo = comment.type === 'visit' ? `/api/visits/${comment.typeId}` :
                      comment.type === 'blog' ? `/api/blogs/${comment.typeId}` : undefined;

        let message;
        if (comment.likes.includes(uuid)) {
            comment.likes = comment.likes.filter(id => id !== uuid);
            message = "Comment unliked successfully";
        } else {
            comment.likes.push(uuid);
            message = "Comment liked successfully";
        }

        await comment.save();

        // Send notification asynchronously
        if (linkTo) {
            // notifUtil.notifyNewComment(comment, linkTo).catch(err =>
                // logger.error('Failed to send like notification:', err)
            // );
        }

        logger.info(`Comment ${message.toLowerCase().replace(' successfully', '')}: ${commentId} by ${uuid}`);
        res.status(200).json({
            message,
            likesCount: comment.likes.length
        });

    } catch (error) {
        logger.error('Comment like toggle error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comments.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Remove comment reference from parent document
        const linkTo = comment.type === 'visit' ? `/api/visits/${comment.typeId}` :
                      comment.type === 'blog' ? `/api/blogs/${comment.typeId}` : undefined;

        if (comment.type === 'visit') {
            await Visits.findByIdAndUpdate(comment.typeId, {
                $pull: { comments: comment._id }
            });
        } else if (comment.type === 'blog') {
            await Blogs.findByIdAndUpdate(comment.typeId, {
                $pull: { comments: comment._id }
            });
        }

        await Comments.findByIdAndDelete(id);

        // Send notification asynchronously
        if (linkTo) {
            // notifUtil.notifyResourceDeleted('comment', id, linkTo).catch(err =>
                // logger.error('Failed to send comment deletion notification:', err)
            // );
        }

        logger.info(`Comment deleted: ${id} from ${comment.type} ${comment.typeId}`);
        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        logger.error('Comment deletion error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}



