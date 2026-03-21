const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createCampaign ,getAllCampaigns
} = require("../controllers/campaignControllers");

router.post("/new",
  createCampaign
);
router.get("/all", getAllCampaigns);
module.exports = router;