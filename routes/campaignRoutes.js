const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const { createCampaign ,getAllCampaigns,deleteCampaign,updateCampaign,toggleStatus
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

router.put("/:id/status",
  toggleStatus
);


module.exports = router;