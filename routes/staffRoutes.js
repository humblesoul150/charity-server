const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { uploadImage, updateStaff, createStaff, getStaff, deleteStaff } = require("../controllers/staffControllers");


router.post("/new",
  
  createStaff
);

router.get("/all", getStaff);

router.delete("/delete/:id",
   
  deleteStaff
);

router.put("/update/:id",
   
  updateStaff
);

module.exports = router;