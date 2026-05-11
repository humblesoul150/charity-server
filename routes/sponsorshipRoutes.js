const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createSponsor ,getSponsorRecords,createPaymentRecord} = require("../controllers/sponsorControllers");
// Create a new sponsor
router.post("/profile/new", createSponsor);

// Get all sponsor records
router.get("/sponsorship/records", getSponsorRecords);

// Create a new payment record
router.post("/sponsorship/:id/new/payment", createPaymentRecord);

module.exports = router;