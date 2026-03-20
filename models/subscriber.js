const mongoose = require("mongoose");

const subscribersSchema = new mongoose.Schema(
  {
        email: { type: String, required: true, unique: true },
         verified: { type: Boolean, default: false },
        verificationToken: { type: String },
        unsubscribed: { type: Boolean, default: false },
            subscribedOn: { type: Date, default: Date.now },
       
       
  },

  { timestamps: true },
);
const Subscriber = mongoose.model("Subscriber", subscribersSchema);

module.exports = Subscriber;
