const Campaigns = require("../models/campaign");
const DeleteImageFromCloudinary = require("../utils/deleteCloudImg");

exports.createCampaign = async (req, res) => { 
    try {
        // const { title, tagline, description, goal, endDate, category } = req.body;
        const { title, tagline, description, goal, endDate,  category, image, imageUrl } = req.body;
        

        const newCampaign = new Campaigns({
            title,
            tagline,
            description,
            goal,
            endDate,
            category,
            image: image,
            raised:[]

        })
        await newCampaign.save();

        res.status(201).json({
            message: "Campaign created successfully",
             
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaigns.find().sort({ createdAt: -1 });
        res.status(200).json(campaigns);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}
 
exports.deleteCampaign = async (req, res) => { 
    try {
        const { id } = req.params;
        const campaign = await Campaigns.findById(id);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        if (campaign.image && campaign.image.public_id) {
            await DeleteImageFromCloudinary(campaign.image.public_id);
        }
        await Campaigns.findByIdAndDelete(id);
        res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}
exports.updateCampaign = async (req, res) => { 
    try {
        const { id } = req.params;
        const updateData = req.body;
 

        const findCampaign = await Campaigns.findById(String(id));
        if (!findCampaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        if (updateData.image.public_id && findCampaign.image.public_id && findCampaign.image.public_id !== updateData.image.public_id) {
            await DeleteImageFromCloudinary(findCampaign.image.public_id);
        }
        const campaign = await Campaigns.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.status(200).json({
            message: "Campaign updated successfully",
             
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.toggleStatus = async (req, res) => { 
    try {
        const { id } = req.params;
        const data = req.body;
        const campaign = await Campaigns.findById(id);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        campaign.status = data.status;
        await campaign.save();
        res.status(200).json({
            message: "Campaign status updated successfully",
            status: campaign.status
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}