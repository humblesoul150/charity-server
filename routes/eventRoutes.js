const Express = require("express");
const router = Express.Router();
const { body, param } = require("express-validator");
const {
   createEvent,getEventById,getEvents,deleteEvent,updateEvent,shareToggle,saveViews 
} = require("../controllers/eventControllers");


router.post("/new",
  createEvent
);

 

 

router.get("/all", getEvents);

router.get("/:id",
   
    getEventById
);

router.delete("/delete/:id",
   
  deleteEvent
);



 

router.put("/update/:id",
   
  updateEvent
);

 

router.post("/:eventId/log-share",
   
  shareToggle
);

router.post("/:eventId/log-view",
   
  saveViews
);

module.exports = router;