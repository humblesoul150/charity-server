const express = require("express");
const { requireAuth, requirePermission } = require("../middleware/auth");
const { getDashboardSummary } = require("../controllers/dashboardControllers");

const router = express.Router();

router.get(
  "/summary",
  requireAuth,
  requirePermission("dashboard.view"),
  getDashboardSummary,
);

module.exports = router;
