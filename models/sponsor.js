const { add } = require("date-fns");
const mongoose = require("mongoose");

const sponsorsSchema = new mongoose.Schema(
  {
    sponsor: {
          email: { type: String, required: true},
          name: { type: String, required: true },
          phone: { type: String, required: true },
    },
    child: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile' },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    donation: {
      amount: { type: Number, required: true },
      period: { type: String, enum: ['Monthly', '3 Months', '6 Months', 'yearly'], required: true },
      remindByEmail: { type: Boolean, default: false },
    },
    paymentMethod: {
      type: String, enum: ['zelle', 'stripe', 'check', 'card', 'paypal', 'ach'],
      required: true,
    }
  },

  { timestamps: true },
);
const Sponsor = mongoose.model("Sponsor", sponsorsSchema);

module.exports = Sponsor;
