const Staff = require("../models/staff");
const DeleteImage = require("../utils/deleteCloudImg");
const { validationResult } = require("express-validator");
// const notifUtil = require('../utils/notificationUtil');

 

exports.createStaff = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { name, email, phone, role, gender, image } = req.body;

        const newStaff = new Staff({
            name,
            email,
            phone,
            role,
            gender,
            photo: image || { url: "", public_id: "" },
        });

        await newStaff.save();

        // Send notification asynchronously
        // notifUtil.notifyResourceCreated('staff member', newStaff, `/about`).catch(err =>
            // logger.error('Failed to send staff creation notification:', err)
        // );

        // logger.info(`Staff member created: ${newStaff._id} - ${name}`);
        res.status(201).json({
            message: "Staff member created successfully",
            staff: { id: newStaff._id, name: newStaff.name }
        });

    } catch (error) {
        // logger.error('Staff creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getStaff = async (req, res) => {
    try {
        const staff = await Staff.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        if (!staff || staff.length === 0) {
            return res.status(404).json({ message: "No staff members found" });
        }

        // logger.info(`Retrieved ${staff.length} staff members`);
        res.status(200).json(staff);

    } catch (error) {
        // logger.error('Get staff error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.deleteStaff = async (req, res) => {
    try {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        // }

        const { id } = req.params;
        const staff = await Staff.findById(id);

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Delete associated photo if exists
        if (staff.photo && staff.photo.public_id) {
             await DeleteImage(staff.photo.public_id);
        }

        await Staff.findByIdAndDelete(id);

        // Send notification asynchronously
        // notifUtil.notifyResourceDeleted('staff member', id).catch(err =>
            // logger.error('Failed to send staff deletion notification:', err)
        // );

        // logger.info(`Staff member deleted: ${id} - ${staff.name}`);
        res.status(200).json({ message: "Staff member deleted successfully" });

    } catch (error) {
        // logger.error('Staff deletion error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.updateStaff = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const updateData = req.body;

        const findStaff = await Staff.findById(id);
        if (!findStaff) {
            return res.status(404).json({ message: "Staff member not found" });
        }
        if (updateData.photo.public_id && findStaff.photo.public_id && findStaff.photo.public_id !== updateData.photo.public_id) {
            await DeleteImage(findStaff.photo.public_id);
        }

        const staff = await Staff.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!staff) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        // Send notification asynchronously
        // notifUtil.notifyResourceUpdated('staff member', staff, `/admin/staff`).catch(err =>
            // logger.error('Failed to send staff update notification:', err)
        // );

        // logger.info(`Staff member updated: ${id} - ${staff.name}`);
        res.status(200).json({
            message: "Staff member updated successfully",
            staff
        });

    } catch (error) {
        // logger.error('Staff update error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}