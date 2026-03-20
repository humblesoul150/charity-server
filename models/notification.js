 const mongoose = require("mongoose");

const notificationsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["system", "visit","subscription","message", "comment", "like", "share", "view"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
   
  linkTo: {
    type: String,
  },
  seen: {
    type: Boolean,
    default: false,
  },

},{ timestamps: true });

const Notification = mongoose.model("Notification", notificationsSchema);

module.exports = Notification;
