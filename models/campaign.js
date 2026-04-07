const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        tagline: { type: String, },
        description: { type: String, required: true },
        category: { type: String, required: true },
        image: { url: String, public_id: String },
        goal: { type: String },
        raised: [{type:Number}],
        endDate : { type: String },
        status: { type: String, enum: ["upcoming","ongoing", "completed"], default: "upcoming" },
         
    },
  { timestamps: true }
);
const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
