const Profiles = require('../models/childProfile');
const deleteImage = require('../utils/deleteCloudImg');

const normalizeEducation = (education = {}) => {
    if (!education || typeof education !== 'object') {
        return {
            currentLevel: '',
            schoolName: '',
            currentClass: '',
            academicYear: '',
            lastTermResult: '',
            graduationTarget: '',
            estimatedGraduationYear: '',
            educationNotes: '',
        };
    }

    const computedLevel = education.currentLevel || education.currentClass || '';
    const estimatedYear = education.estimatedGraduationYear || getEstimatedGraduationYear(computedLevel);

    return {
        currentLevel: education.currentLevel || '',
        schoolName: education.schoolName || '',
        currentClass: education.currentClass || '',
        academicYear: education.academicYear || '',
        lastTermResult: education.lastTermResult || '',
        graduationTarget: education.graduationTarget || '',
        estimatedGraduationYear: estimatedYear,
        educationNotes: education.educationNotes || '',
    };
};

function getEstimatedGraduationYear(currentLevel = '') {
    const normalized = String(currentLevel || '').toLowerCase();
    let yearsRemaining = 3;

    if (normalized.includes('primary')) yearsRemaining = 5;
    else if (normalized.includes('secondary') || normalized.includes('senior')) yearsRemaining = 4;
    else if (normalized.includes('college') || normalized.includes('university') || normalized.includes('tertiary')) yearsRemaining = 4;
    else if (normalized.includes('vocational')) yearsRemaining = 2;

    return String(new Date().getFullYear() + yearsRemaining);
}

const normalizeReportCards = (reportCards = []) => {
    if (!Array.isArray(reportCards)) {
        return [];
    }

    return reportCards
        .filter((card) => card && (card.url || card.public_id || card.name))
        .map((card) => ({
            name: card.name || '',
            url: card.url || '',
            public_id: card.public_id || '',
            fileType: card.fileType || '',
            uploadedAt: card.uploadedAt || new Date(),
        }));
};

//create child profile
exports.createChildProfile = async (req, res) => { 
    try {
        const data = req.body;
        const stringNeeds = Array.isArray(data.needs) ? data.needs.join(', ') : data.needs || '';
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
        res.status(201).json({ message: "Child profile created successfully", profile: newProfile });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.updateChildProfile = async (req, res) => { 
    try {

        const data = req.body;
        const stringNeeds = Array.isArray(data.needs) ? data.needs.join(', ') : data.needs || '';
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
        
        const updatedProfile = await Profiles.findByIdAndUpdate(req.params.id, payLoad, { new: true, runValidators: true });
        if (!updatedProfile) {
            return res.status(404).json({ message: "Child profile not found" });
        }
        res.status(200).json({ message: "Child profile updated successfully", profile: updatedProfile });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getProfiles = async (req, res) => { 
    try {
        const profiles = await Profiles.find().populate('sponsor').sort({ createdAt: -1 });
        res.status(200).json(profiles);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.deleteChildProfile = async (req, res) => { 
    try {
        const deletedProfile = await Profiles.findById(req.params.id);
        if (!deletedProfile) {
            return res.status(404).json({ message: "Child profile not found" });
        }
        await deleteImage(deletedProfile.image);
        await Profiles.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Child profile deleted successfully", profile: deletedProfile });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getChildProfileById = async (req, res) => { 
    try {
        const profile = await Profiles.findById(req.params.id).populate('sponsor');
        if (!profile) {
            return res.status(404).json({ message: "Child profile not found" });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}