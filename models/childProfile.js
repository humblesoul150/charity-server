const mongoose = require("mongoose");

const reportCardSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    public_id: { type: String, trim: true },
    fileType: { type: String, trim: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const educationSchema = new mongoose.Schema(
  {
    currentLevel: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    currentClass: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    lastTermResult: { type: String, trim: true },
    graduationTarget: { type: String, trim: true },
    estimatedGraduationYear: { type: String, trim: true },
    educationNotes: { type: String, trim: true },
  },
  { _id: false },
);

const estimateEducationGraduationYear = (currentLevel = '', currentClass = '') => {
  const raw = `${currentLevel} ${currentClass}`.toLowerCase();

  if (raw.includes('primary')) return String(new Date().getFullYear() + 5);
  if (raw.includes('secondary') || raw.includes('senior')) return String(new Date().getFullYear() + 4);
  if (raw.includes('college') || raw.includes('university') || raw.includes('tertiary')) return String(new Date().getFullYear() + 4);
  if (raw.includes('vocational')) return String(new Date().getFullYear() + 2);

  return String(new Date().getFullYear() + 3);
};

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
    guardianName: { type: String, trim: true },
    guardianContact: { type: String, trim: true },
    guardianRelation: {
      type: String,
      enum: ['caretaker', 'mom', 'dad', 'sibling', 'uncle', 'aunt', 'grandparent'],
      trim: true,
    },
    image: { url: { type: String }, public_id: { type: String } },
    background: { type: String, trim: true },
    location: { type: String, trim: true },
    needs: { type: String, trim: true },
    sponsorshipStatus: { type: String, enum: ['Sponsored', 'Available'], default: 'Available' },
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' },
    school: { type: String, trim: true },
    monthlyNeed: { type: Number, trim: true },
    education: {
      type: educationSchema,
      default: {
        currentLevel: '',
        schoolName: '',
        currentClass: '',
        academicYear: '',
        lastTermResult: '',
        graduationTarget: '',
        estimatedGraduationYear: '',
        educationNotes: '',
      },
    },
    reportCards: [reportCardSchema],
  },

  { timestamps: true },
);

childrenProfilesSchema.pre('save', function(next) {
  if (this.education && !this.education.estimatedGraduationYear) {
    this.education.estimatedGraduationYear = estimateEducationGraduationYear(
      this.education.currentLevel,
      this.education.currentClass,
    );
  }

  next();
});

const ChildProfile = mongoose.model("ChildProfile", childrenProfilesSchema);

module.exports = ChildProfile;
