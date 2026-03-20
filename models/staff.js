const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        role: { type: String, required: true },
        photo: { url: String, public_id: String },
        gender: { type: String, enum: ["Male", "Female"] },
        
    },
  { timestamps: true }
);
const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
