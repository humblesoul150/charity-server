const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

contentSchema.index({ section: 1, status: 1 });

module.exports = mongoose.model("Content", contentSchema);