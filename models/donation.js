const mongoose = require("mongoose");

const donationsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [  "blog"],
    },
    typeId: { type: String, required: true },
    name: { type: String, required: true },
    comment: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    likes: [{ type: String }],
  },

  { timestamps: true },
);
const Donations = mongoose.model("Donation", donationsSchema);

module.exports = Donations;
