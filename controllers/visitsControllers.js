const Visits = require("../models/visit");
const DeleteImage = require("../utils/deleteCloudImg");
const { validationResult } = require("express-validator");
// const notifUtil = require('../utils/notificationUtil');

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs");

// Constants
const UPLOAD_PRESET = process.env.CLOUDINARY_SIGNED_PRESET || "your_signed_preset";
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "default_folder";
const UPLOAD_DEST = "uploads/";

const upload = multer({ dest: UPLOAD_DEST });
/**
 * Upload image to Cloudinary
 */
exports.uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        { timestamp, upload_preset: UPLOAD_PRESET, folder: CLOUDINARY_FOLDER },
        process.env.CLOUDINARY_API_SECRET
      );

      const result = await cloudinary.uploader.upload(req.file.path, {
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp,
        upload_preset: UPLOAD_PRESET,
        folder: CLOUDINARY_FOLDER,
        signature,
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

    //   logger.info(`Visit image uploaded successfully: ${result.public_id}`);
      res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
        //   logger.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

    //   logger.error('Visit image upload error:', error);
      res.status(500).json({ message: "Image upload failed", error: error.message });
    }
  }
];

exports.createVisit = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const {
            title,
            community,
            country,
            date,
            excerpt,
            content,
            thumbnail,
            videoId,
            status,
            participants,
            gallery,
            location
        } = req.body;

        const newVisit = new Visits({
            title,
            community,
            country,
            date,
            excerpt,
            content,
            thumbnail: thumbnail || { url: "", public_id: "" },
            videoId: videoId || "",
            status: status || "",
            participants: participants || [],
            gallery: gallery || [],
            location: location || { long: 0, lat: 0 },
            likes: [],
            views: [],
            shares: [],
            featured: []
        });

        await newVisit.save();

        // Send notification asynchronously
        // notifUtil.notifyResourceCreated('visit', newVisit, `/api/visits/${newVisit._id}`).catch(err =>
            // logger.error('Failed to send visit creation notification:', err)
        // );

        // logger.info(`Visit created: ${newVisit._id} - ${title}`);
        res.status(201).json({
            message: "Visit created successfully",
            visit: { id: newVisit._id, title: newVisit.title }
        });

    } catch (error) {
        // logger.error('Visit creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.addParticipant = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const participantData = req.body;

        const visit = await Visits.findById(id);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        visit.participants.push(participantData);
        await visit.save();

        // logger.info(`Participant added to visit: ${id}`);
        res.status(200).json({
            message: "Participant added successfully",
            participantsCount: visit.participants.length
        });

    } catch (error) {
        // logger.error('Add participant error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.removeParticipant = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const { participantId } = req.body;

        const visit = await Visits.findById(id);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const participantIndex = visit.participants.findIndex(p => p._id.toString() === participantId);
        if (participantIndex === -1) {
            return res.status(404).json({ message: "Participant not found in this visit" });
        }

        const participant = visit.participants[participantIndex];

        // Delete associated photo if exists
        if (participant.photo && participant.photo.public_id) {
            try {
                await DeleteImage(participant.photo.public_id);
                // logger.info(`Deleted participant photo: ${participant.photo.public_id}`);
            } catch (imageError) {
                // logger.error('Failed to delete participant photo:', imageError);
                // Don't fail the whole operation
            }
        }

        visit.participants.splice(participantIndex, 1);
        await visit.save();

        // logger.info(`Participant removed from visit: ${id}, participant: ${participantId}`);
        res.status(200).json({
            message: "Participant removed successfully",
            participantsCount: visit.participants.length
        });

    } catch (error) {
        // logger.error('Remove participant error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.removeImage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const { galleryId } = req.body;

        const visit = await Visits.findById(id);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        const imageIndex = visit.gallery.findIndex(img => img._id.toString() === galleryId);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "Image not found in this visit" });
        }

        const image = visit.gallery[imageIndex];

        // Delete image from Cloudinary
        if (image.public_id) {
            try {
                await DeleteImage(image.public_id);
                // logger.info(`Deleted gallery image: ${image.public_id}`);
            } catch (imageError) {
                // logger.error('Failed to delete gallery image:', imageError);
                // Don't fail the whole operation
            }
        }

        visit.gallery.splice(imageIndex, 1);
        await visit.save();

        // logger.info(`Gallery image removed from visit: ${id}`);
        res.status(200).json({
            message: "Image removed successfully",
            galleryCount: visit.gallery.length
        });

    } catch (error) {
        // logger.error('Remove image error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.addImage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const { image } = req.body;

        const visit = await Visits.findById(id);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        visit.gallery.push(image);
        await visit.save();

        // logger.info(`Gallery image added to visit: ${id}`);
        res.status(200).json({
            message: "Image added successfully",
            galleryCount: visit.gallery.length
        });

    } catch (error) {
        // logger.error('Add image error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getVisits = async (req, res) => {
    try {
        const visits = await Visits.find()
            .sort({ createdAt: -1 })
            .populate("comments")
            .select('-__v');

        if (!visits || visits.length === 0) {
            return res.status(404).json({ message: "No visits found" });
        }

        // logger.info(`Retrieved ${visits.length} visits`);
        res.status(200).json(visits);

    } catch (error) {
        // logger.error('Get visits error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getVisitById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const visit = await Visits.findById(id)
            .populate("comments")
            .select('-__v');

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // logger.info(`Visit retrieved: ${id}`);
        res.status(200).json(visit);

    } catch (error) {
        // logger.error('Get visit by ID error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.deleteVisit = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const visit = await Visits.findById(id);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // Delete associated images
        if (visit.thumbnail && visit.thumbnail.public_id) {
            try {
                await DeleteImage(visit.thumbnail.public_id);
                // logger.info(`Deleted visit thumbnail: ${visit.thumbnail.public_id}`);
            } catch (imageError) {
                // logger.error('Failed to delete visit thumbnail:', imageError);
            }
        }

        if (visit.gallery && visit.gallery.length > 0) {
            for (const img of visit.gallery) {
                if (img.public_id) {
                    try {
                        await DeleteImage(img.public_id);
                        // logger.info(`Deleted gallery image: ${img.public_id}`);
                    } catch (imageError) {
                        // logger.error('Failed to delete gallery image:', imageError);
                    }
                }
            }
        }

        await Visits.findByIdAndDelete(id);

        // Send notification asynchronously
        // notifUtil.notifyResourceDeleted('visit', id).catch(err =>
        //     // logger.error('Failed to send visit deletion notification:', err)
        // );

        // logger.info(`Visit deleted: ${id} - ${visit.title}`);
        res.status(200).json({ message: "Visit deleted successfully" });

    } catch (error) {
        // logger.error('Visit deletion error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.updateVisit = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const updateData = req.body;

        const visit = await Visits.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate("comments");

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // Send notification asynchronously
        // notifUtil.notifyResourceUpdated('visit', visit, `/api/visits/${visit._id}`).catch(err =>
        //     // logger.error('Failed to send visit update notification:', err)
        // );

        // logger.info(`Visit updated: ${id} - ${visit.title}`);
        res.status(200).json({
            message: "Visit updated successfully",
            visit
        });

    } catch (error) {
        // logger.error('Visit update error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


exports.toggleFeatured = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const visit = await Visits.findById(id);

        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // Initialize isFeatured if it doesn't exist
        if (!visit.isFeatured) {
            visit.isFeatured = [];
        }

        const index = visit.isFeatured.indexOf(id);
        if (index === -1) {
            // If already at max featured visits (3), remove the oldest
            if (visit.isFeatured.length >= 3) {
                visit.isFeatured.shift(); // Remove first item
            }
            visit.isFeatured.push(id);
        } else {
            visit.isFeatured.splice(index, 1);
        }

        await visit.save();

        const isFeatured = visit.isFeatured.includes(id);
        // logger.info(`Visit ${isFeatured ? 'featured' : 'unfeatured'}: ${id}`);
        res.status(200).json({
            message: `Visit ${isFeatured ? 'marked as' : 'removed from'} featured`,
            isFeatured
        });

    } catch (error) {
        // logger.error('Toggle featured error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


exports.likeToggle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { visitId } = req.params;
        const { uuid } = req.body;

        const visit = await Visits.findById(visitId);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        let message;
        if (visit.likes.includes(uuid)) {
            visit.likes = visit.likes.filter(id => id !== uuid);
            message = "Visit unliked successfully";
        } else {
            visit.likes.push(uuid);
            message = "Visit liked successfully";
        }

        await visit.save();

        // logger.info(`${message.toLowerCase().replace(' successfully', '')}: ${visitId} by ${uuid}`);
        res.status(200).json({
            message,
            likesCount: visit.likes.length
        });

    } catch (error) {
        // logger.error('Visit like toggle error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.shareToggle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { visitId } = req.params;
        const { uuid } = req.body;

        const visit = await Visits.findById(visitId);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // Check if already shared by this user
        if (visit.shares.includes(uuid)) {
            return res.status(200).json({
                message: "Visit already shared by this user",
                sharesCount: visit.shares.length
            });
        }

        visit.shares.push(uuid);
        await visit.save();

        // logger.info(`Visit shared: ${visitId} by ${uuid}`);
        res.status(200).json({
            message: "Visit shared successfully",
            sharesCount: visit.shares.length
        });

    } catch (error) {
        // logger.error('Visit share error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.saveViews = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { visitId } = req.params;
        const { uuid } = req.body;

        const visit = await Visits.findById(visitId);
        if (!visit) {
            return res.status(404).json({ message: "Visit not found" });
        }

        // Check if view already exists
        if (visit.views.includes(uuid)) {
            return res.status(200).json({
                message: "Visit view already recorded",
                viewsCount: visit.views.length
            });
        }

        visit.views.push(uuid);
        await visit.save();

        // logger.info(`Visit view recorded: ${visitId} by ${uuid}`);
        res.status(200).json({
            message: "Visit view saved successfully",
            viewsCount: visit.views.length
        });

    } catch (error) {
        // logger.error('Visit save view error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
