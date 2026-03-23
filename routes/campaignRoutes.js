const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createCampaign ,getAllCampaigns,deleteCampaign,updateCampaign
} = require("../controllers/campaignControllers");

router.post("/new",
  createCampaign
);
router.get("/all", getAllCampaigns);
router.delete("/:id/delete",
  deleteCampaign
);

router.put("/:id/update",
  updateCampaign
);


module.exports = router;