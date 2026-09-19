const Profiles = require("../models/childProfile");
const deleteImage = require("../utils/deleteCloudImg");
const mongoose = require("mongoose");

const normalizeEducation = (education = {}) => {
  if (!education || typeof education !== "object") {
    return {
      isStudying: false,
      currentLevel: "",
      schoolName: "",
      classGrade: "",
      currentClass: "",
      academicYear: "",
      expectedGraduationYear: "",
      lastTermResult: "",
      graduationTarget: "",
      educationNotes: "",
    };
  }

  const classGrade = education.classGrade || education.currentClass || "";
  const expectedGraduationYear =
    education.expectedGraduationYear || education.estimatedGraduationYear || "";

  return {
    isStudying: Boolean(education.isStudying),
    currentLevel: education.currentLevel || "",
    schoolName: education.schoolName || "",
    classGrade,
    currentClass: classGrade,
    academicYear: education.academicYear || "",
    expectedGraduationYear,
    lastTermResult: education.lastTermResult || "",
    graduationTarget: education.graduationTarget || "",
    educationNotes: education.educationNotes || "",
  };
};

function getEstimatedGraduationYear(currentLevel = "") {
  const normalized = String(currentLevel || "").toLowerCase();
  let yearsRemaining = 3;

  if (normalized.includes("primary")) yearsRemaining = 5;
  else if (normalized.includes("secondary") || normalized.includes("senior"))
    yearsRemaining = 4;
  else if (
    normalized.includes("college") ||
    normalized.includes("university") ||
    normalized.includes("tertiary")
  )
    yearsRemaining = 4;
  else if (normalized.includes("vocational")) yearsRemaining = 2;

  return String(new Date().getFullYear() + yearsRemaining);
}

const normalizeReportCards = (reportCards = []) => {
  if (!Array.isArray(reportCards)) {
    return [];
  }

  return reportCards
    .filter((card) => card && (card.url || card.public_id || card.name))
    .map((card) => ({
      ...(card._id ? { _id: card._id } : {}),
      name: card.name || "",
      description: card.description || "",
      url: card.url || "",
      public_id: card.public_id || "",
      fileType: card.fileType || "",
      uploadedAt: card.uploadedAt || new Date(),
    }));
};

//create child profile
exports.createChildProfile = async (req, res) => {
  try {
    const data = req.body;
    const stringNeeds = Array.isArray(data.needs)
      ? data.needs.join(", ")
      : data.needs || "";
    const education = normalizeEducation(data.education);
    if (!education.schoolName && data.school) {
      education.schoolName = data.school;
    }

    const payLoad = {
      ...data,
      needs: stringNeeds,
      education,
      reportCards: normalizeReportCards(data.reportCards),
    };

    const newProfile = new Profiles({ ...payLoad, sponsor: null });
    await newProfile.save();
    res
      .status(201)
      .json({
        message: "Child profile created successfully",
        profile: newProfile,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

exports.updateChildProfile = async (req, res) => {
  try {
    const data = req.body;
    const stringNeeds = Array.isArray(data.needs)
      ? data.needs.join(", ")
      : data.needs || "";
    const education = normalizeEducation(data.education);
    if (!education.schoolName && data.school) {
      education.schoolName = data.school;
    }

    const payLoad = {
      ...data,
      needs: stringNeeds,
      education,
    };
    if (Object.prototype.hasOwnProperty.call(data, "reportCards")) {
      payLoad.reportCards = normalizeReportCards(data.reportCards);
    }

    const updatedProfile = await Profiles.findByIdAndUpdate(
      req.params.id,
      payLoad,
      { new: true, runValidators: true },
    );
    if (!updatedProfile) {
      return res.status(404).json({ message: "Child profile not found" });
    }
    res
      .status(200)
      .json({
        message: "Child profile updated successfully",
        profile: updatedProfile,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profiles.find()
      .populate("sponsor")
      .sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

exports.deleteChildProfile = async (req, res) => {
  try {
    const deletedProfile = await Profiles.findById(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ message: "Child profile not found" });
    }
    await deleteImage(deletedProfile.image);
    await Profiles.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({
        message: "Child profile deleted successfully",
        profile: deletedProfile,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

exports.getChildProfileById = async (req, res) => {
  try {
    const profile = await Profiles.findById(req.params.id).populate("sponsor");
    if (!profile) {
      return res.status(404).json({ message: "Child profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    console.log("====================================");
    console.log(error);
    console.log("====================================");
  }
};

exports.addReportCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, public_id, fileType } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid child profile id" });
    }
    if (
      !String(name || "").trim() ||
      !String(url || "").trim() ||
      !String(public_id || "").trim()
    ) {
      return res
        .status(400)
        .json({
          message:
            "Report title, image URL, and Cloudinary public ID are required",
        });
    }

    const updatedProfile = await Profiles.findByIdAndUpdate(
      id,
      {
        $push: {
          reportCards: {
            name: String(name).trim(),
            url: String(url).trim(),
            public_id: String(public_id).trim(),
            fileType: String(fileType || "image").trim(),
            uploadedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    return res.status(201).json({
      message: "Report card uploaded successfully",
      profile: updatedProfile,
      reportCard:
        updatedProfile.reportCards[updatedProfile.reportCards.length - 1],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to save report card", error: error.message });
  }
};

exports.deleteReportCard = async (req, res) => {
  try {
    const { id, reportCardId } = req.params;
    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(reportCardId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid child or report card id" });
    }

    const profile = await Profiles.findById(id);
    if (!profile)
      return res.status(404).json({ message: "Child profile not found" });

    const reportCard = profile.reportCards.id(reportCardId);
    if (!reportCard)
      return res.status(404).json({ message: "Report card not found" });

    if (reportCard.public_id) {
      await deleteImage(reportCard.public_id, "image");
    }

    const updatedProfile = await Profiles.findByIdAndUpdate(
      id,
      { $pull: { reportCards: { _id: reportCardId } } },
      { new: true },
    );

    return res.status(200).json({
      message: "Report card deleted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to delete report card", error: error.message });
  }
};
