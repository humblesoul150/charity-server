const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
 

exports.registerAdmin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { username, password, role } = req.body;
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
            role: role || "admin",
        });
        await newAdmin.save();
        // logger.info(`New admin registered: ${username}`);
        res.status(201).json({ message: "Admin registered successfully" });

    } catch (error) {
        //  logger.error('Admin registration error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.loginAdmin = async (req, res) => { 
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            logger.warn(`Failed login attempt for non-existent user: ${username}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            logger.warn(`Failed login attempt for user: ${username}`);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || "7d" });
        admin.loggedIn = true;
        admin.lastLogin = Date.now();
        admin.loginLogs.push(Date.now());
        await admin.save();

        // logger.info(`Admin logged in: ${username}`);
        const adminData = {
            id: admin._id,
            username: admin.username,
            role: admin.role,
            token: token,
        };

        res.status(200).json(adminData);

    } catch (error) {
        logger.error('Admin login error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.logoutAdmin = async (req, res) => { 
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found!" });
        }
        admin.loggedIn = false;
        await admin.save();
        // logger.info(`Admin logged out: ${admin.username}`);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        logger.error('Admin logout error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

