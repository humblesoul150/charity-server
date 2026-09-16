const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
  createSponsor,
  getSponsorRecords,
  getSponsorById,
  createPaymentRecord,
  getSponsorChildren,
  getChildSponsor,
  updateSponsorshipStatus,
  reassignSponsor,
  updateSponsorProfile
} = require("../controllers/sponsorControllers");
// Create a new sponsor
router.post("/profile/new", createSponsor);

// Complete or edit a sponsor profile
router.patch("/profile/:id", updateSponsorProfile);

// Get all sponsor records
router.get("/sponsorship/records", getSponsorRecords);

// Get sponsor by id including child relationship summary
router.get("/:id", getSponsorById);

// Get sponsored children for a sponsor
router.get("/:id/children", getSponsorChildren);

// Get sponsor assignment records for a child
router.get("/child/:childId", getChildSponsor);

// Update sponsorship lifecycle status
router.patch("/sponsorship/:id/status", updateSponsorshipStatus);

// Reassign a sponsor to a child
router.patch("/reassign", reassignSponsor);

// Create a new payment record
router.post("/sponsorship/:id/new/payment", createPaymentRecord);

module.exports = router;