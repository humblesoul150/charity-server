const Express = require("express");
const { body } = require("express-validator");
const router = Express.Router();
const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} = require("../controllers/adminControllers");
const { requireAuth, requirePermission } = require("../middleware/auth");

router.post(
  "/admin/register",
  requireAuth,
  requirePermission("users.manage"),
  body("role").optional().isIn(["developer", "admin", "editor"]).withMessage("Role must be developer, admin, or editor"),
  registerAdmin,
);
router.post("/admin/login", loginAdmin);
router.get("/admin/me", requireAuth, getCurrentAdmin);
router.post("/admin/logout", requireAuth, logoutAdmin);

module.exports = router;
