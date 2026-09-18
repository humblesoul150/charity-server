const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentControllers");

const router = express.Router();

router.get("/", getContent);
router.get("/all", requireAuth, getContent);
router.get("/:id", getContentById);
router.post("/", requireAuth, createContent);
router.put("/:id", requireAuth, updateContent);
router.delete("/:id", requireAuth, deleteContent);

module.exports = router;