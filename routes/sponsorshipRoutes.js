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
  updateSponsorProfile,
  getProfiles,
  archiveSponsorProfile,
  unlinkChildSponsor,
  recordSplitPayment,
} = require("../controllers/sponsorControllers");
const { requireAuth, requirePermission } = require("../middleware/auth");
// Create a new sponsor
router.post(
  "/profile/new",
  requireAuth,
  requirePermission("sponsorships.manage"),
  createSponsor,
);

// Complete or edit a sponsor profile
router.patch(
  "/profile/:id",
  requireAuth,
  requirePermission("sponsorships.manage"),
  updateSponsorProfile,
);

// Archive a sponsor profile while preserving sponsorship and payment history
router.delete(
  "/profile/:id",
  requireAuth,
  requirePermission("sponsorships.manage"),
  archiveSponsorProfile,
);

// Get all sponsor records
router.get("/sponsorship/records", getSponsorRecords);

// Get all sponsor profiles
router.get("/profiles/all", getProfiles);

// Get sponsor assignment records for a child
router.get("/child/:childId", getChildSponsor);

// Get sponsored children for a sponsor
router.get("/:id/children", getSponsorChildren);

// Get sponsor by id including child relationship summary
router.get("/:id", getSponsorById);

// Unlink a child from its current sponsor while preserving sponsorship history
router.patch(
  "/child/:childId/unlink",
  requireAuth,
  requirePermission("sponsorships.manage"),
  unlinkChildSponsor,
);

// Record one manual donation across one or more child sponsorships
router.post(
  "/:sponsorId/payments/split",
  requireAuth,
  requirePermission("sponsorships.manage"),
  recordSplitPayment,
);

// Update sponsorship lifecycle status
router.patch("/sponsorship/:id/status", updateSponsorshipStatus);

// Reassign a sponsor to a child
router.patch(
  "/reassign",
  requireAuth,
  requirePermission("sponsorships.manage"),
  reassignSponsor,
);

// Create a new payment record
router.post(
  "/sponsorship/:id/new/payment",
  requireAuth,
  requirePermission("sponsorships.manage"),
  createPaymentRecord,
);

module.exports = router;
