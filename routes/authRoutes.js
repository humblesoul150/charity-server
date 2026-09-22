const Express = require("express");
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
  registerAdmin,
);
router.post("/admin/login", loginAdmin);
router.get("/admin/me", requireAuth, getCurrentAdmin);
router.post("/admin/logout", requireAuth, logoutAdmin);

module.exports = router;
