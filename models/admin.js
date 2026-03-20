const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "blogger"], default: "admin" },
      loggedIn: { type: Boolean, default: false },
        lastLogin: { type: Date },
        loginLogs: [{ type: Date }],
       
       
  },

  { timestamps: true },
);
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
