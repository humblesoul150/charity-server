const mongoose = require("mongoose");

const donationsSchema = new mongoose.Schema(
    {
        type: { type: String, required: true, enum: ["campaign", "event", "general"] },
        typeId: { type: String, required: true },
        amount: { type: Number, required: true },
        donorName: { type: String, required: true },
        donorEmail: { type: String, required: true },
        companyName: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
  { timestamps: true },
);
const Donations = mongoose.model("Donation", donationsSchema);

module.exports = Donations;
