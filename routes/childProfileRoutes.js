const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createChildProfile, getProfiles, getChildProfileById, updateChildProfile, deleteChildProfile, } = require("../controllers/childProfileControllers");

// Create a new child profile
router.post("/profile/new",
  createChildProfile
);

//update child profile
router.put("/profile/:id/update",
  updateChildProfile
);

// Get all child profiles
router.get("/profiles", getProfiles);

//delete child profile
router.delete("/profile/:id/delete", deleteChildProfile);


// Get a child profile by ID
router.get("/profile/:id", getChildProfileById);

module.exports = router;