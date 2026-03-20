const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const { url } = require("../configs/cloudinary");

const visitsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        community: { type: String, required: true },
        country: { type: String, required: true },
        date: { type: String, required: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        thumbnail: { url: String, public_id: String },
        videoId: { type: String },
        participants:[{name: String, role: String, phone: String,photo: { url: String, public_id: String }}],
        gallery: [{ url: String, public_id: String }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        location: { long: Number, lat: Number },
        status: { type: String, enum: ["upcoming", "visited"], default: "upcoming" },
        likes: [{ type: String }],
        views: [{ type: String }],
        shares: [{ type: String }],
        isFeatured: [{ type: String}],
        
        
         
    },
  { timestamps: true }
);
const Visits = mongoose.model("Visit", visitsSchema);

module.exports = Visits;
