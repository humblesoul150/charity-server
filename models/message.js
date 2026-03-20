const { urlencoded } = require("body-parser");
const mongoose = require("mongoose");
const { url } = require("../configs/cloudinary");

const messagesSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, required: true },
        message: { type: String, required: true },
        reply: { reply: String, repliedOn: Date },
        isRead: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
         
        
         
    },
  { timestamps: true }
);
const Messages = mongoose.model("Message", messagesSchema);

module.exports = Messages;
