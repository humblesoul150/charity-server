const Campaigns = require("../models/campaign");

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
            image:  imageUrl  ?  { url: imageUrl, public_id: "" }:image || { url: "", public_id: "" },
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