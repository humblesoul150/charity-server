const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    role: { type: String, default: "contact", trim: true },
    message: { type: String, required: true, trim: true },
    reply: { reply: String, repliedOn: Date },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Messages = mongoose.model("Message", messagesSchema);

module.exports = Messages;
