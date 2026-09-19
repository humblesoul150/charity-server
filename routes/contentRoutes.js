const express = require("express");
const { requireAuth, requirePermission } = require("../middleware/auth");
const {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentControllers");

const router = express.Router();

router.get("/", getContent);
router.get("/all", requireAuth, requirePermission("content.view"), getContent);
router.get("/:id", getContentById);
router.post(
  "/",
  requireAuth,
  requirePermission("content.manage"),
  createContent,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("content.manage"),
  updateContent,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("content.manage"),
  deleteContent,
);

module.exports = router;
