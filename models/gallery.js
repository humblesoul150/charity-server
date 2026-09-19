const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: {
      type: String,
      required: true,
      enum: ["Events", "Education", "Volunteers", "General"],
    },
    featured: { type: Boolean, default: false },
    image: { url: String, public_id: String, size: String },
  },

  { timestamps: true },
);
const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
