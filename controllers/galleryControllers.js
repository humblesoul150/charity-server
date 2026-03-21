const Gallery = require("../models/gallery");

exports.createGalleryItem = async (req, res) => {
    try {
        const { title, category, featured, image,imageUrl } = req.body;

        const newGalleryItem = new Gallery({
            title,
            category,
            featured,
            image: imageUrl ? { url: imageUrl, public_id: "", size: 'unknown' } :image|| { url: "", public_id: "", size: 'unknown' },
        });
        await newGalleryItem.save();
 
        res.status(201).json(newGalleryItem);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}

exports.getAllGalleryItems = async (req, res) => { 
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.status(200).json(gallery);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
}