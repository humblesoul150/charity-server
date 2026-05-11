const Profiles = require('../models/childProfile');
const deleteImage = require('../utils/deleteCloudImg');

//create child profile
exports.createChildProfile = async (req, res) => { 
    try {
        const data = req.body;
        const stringGardianName = data.guardianNames.join(', '); 
        const stringHobbies = data.hobbies.join(', ');  
        const stringInterests = data.interests.join(', ');  
        const stringNeeds = data.needs.join(', '); 

        const payLoad = { ...data, guardianNames: stringGardianName, hobbies: stringHobbies, interests: stringInterests, needs: stringNeeds };
         
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
         const stringGardianName = data.guardianNames.join(', '); 
        const stringHobbies = data.hobbies.join(', ');  
        const stringInterests = data.interests.join(', ');  
        const stringNeeds = data.needs.join(', '); 
        const payLoad = { ...data, guardianNames: stringGardianName, hobbies: stringHobbies, interests: stringInterests, needs: stringNeeds };
        
        const updatedProfile = await Profiles.findByIdAndUpdate(req.params.id, payLoad, { new: true });
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
        const profiles = await Profiles.find();
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
        const profile = await Profiles.findById(req.params.id);
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