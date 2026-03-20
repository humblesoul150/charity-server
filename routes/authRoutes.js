const Express = require("express");
const router = Express.Router();
  const {registerAdmin,loginAdmin,logoutAdmin} = require("../controllers/adminControllers");

 router.post("/admin/register", registerAdmin);
 router.post("/admin/login", loginAdmin);
 router.post("/admin/logout", logoutAdmin);
 

module.exports = router;