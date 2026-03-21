const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        tagline: { type: String, },
        description: { type: String, required: true },
        image: { url: String, public_id: String },
        goal: { type: String },
        raised: { type: String },
        endDate : { type: String },
    status: { type: String, enum: ["ongoing","upcoming", "completed"], default: "upcoming" },
        donations: [{ amount: Number, donorName: String, date: Date }],
    },
  { timestamps: true }
);
const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
