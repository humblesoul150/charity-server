const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        image: { url: String, public_id: String },
        
        location: { type: String, required: true },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        status: { type: String, enum: ["upcoming", "past"], default: "upcoming" },
         
       
        shares: [{ type: String }],
         
        
        
         
    },
  { timestamps: true }
);
const Events = mongoose.model("Event", eventsSchema);

module.exports = Events;
