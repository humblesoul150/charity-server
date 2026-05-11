const { tr } = require("date-fns/locale");
const mongoose = require("mongoose");

const childrenProfilesSchema = new mongoose.Schema(
  {
       firstName: { type: String, required: true },
       secondName: { type: String, required: true },
       givenName: { type: String, required: true },
        gender: { type: String, required: true, enum: ['Male', 'Female'] },
        dateOfBirth: { type: Date, required: true },
        age: { type: Number, required: true },
        ageGroup: { type: String, required: true },
        class: { type: String, required: true },
        nationality: { type: String, required: true },
    familyStatus: { type: String, required: true, enum: ['Single Parent', 'Total Orphan'] },
        numberOfParents: { type: Number, required: true },
        guardianNames: { type: String},
        image: { url: { type: String }, public_id: { type: String } },
        story: { type: String, trim: true },
    background: { type: String, trim: true },
    hobbies: { type: String, trim: true },
    interests: { type: String, trim: true },
    location: { type: String, trim: true },
    needs: { type: String, trim: true }, monthlyNeed: { type: String, trim: true },
    sponsorshipStatus: { type: String, enum: ['Sponsored', 'Available'], default: 'Available' },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' },
    school: { type: String, trim: true },
    monthlyNeed: { type: Number, trim: true },
        
       
      
  },

  { timestamps: true },
);
const ChildProfile = mongoose.model("ChildProfile", childrenProfilesSchema);

module.exports = ChildProfile;
