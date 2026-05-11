const mongoose = require("mongoose");

const sponsorshipsSchema = new mongoose.Schema(
  {
        child: { type: mongoose.Schema.Types.ObjectId, ref: 'ChildProfile', required: true },
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor', required: true },
        startDate: { type: Date, required: true },
         
        amount: { type: Number, required: true },
        status: { type: String, enum: ['Active', 'Completed', 'Cancelled','Pending'], default: 'Pending' },
        payments: [{
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            method: { type: String, enum: ['ACH', 'Bank Transfer', 'PayPal','Zelle', 'Stripe', 'Check', 'PayPal'], required: true },
            transactionId: { type: String, required: true },
          notes: { type: String, trim: true },
            status: { type: String, enum: ['Completed', 'Failed', 'Pending'], default: 'Pending' },
    }],
    lastPayment: { type: Date },
        totalPaid: { type: Number, default: 0 },
        
  },

  { timestamps: true },
);
const Sponsorships = mongoose.model("Sponsorships", sponsorshipsSchema);

module.exports = Sponsorships;
