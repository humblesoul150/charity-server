const Express = require("express");
const router = Express.Router();
const {
  registerAdmin,
  loginAdmin,
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
router.post("/admin/logout", logoutAdmin);

module.exports = router;
