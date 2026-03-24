const Blogs = require("../models/blog");
const DeleteImage = require("../utils/deleteCloudImg");
const { validationResult } = require("express-validator");
// const notifUtil = require('../utils/notificationUtil');

 

exports.createBlog = async (req, res) => {
    try {
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        // }
        
       

        const { title, content, excerpt, status, image,imageUrl, author, videoId,category } = req.body;

        const newBlog = new Blogs({
            title, content, excerpt, status,
            image: image || (imageUrl ? { url: imageUrl, public_id: '' } : { url: '', public_id: '' })
            , author,
            videoId,
            category,
            comments: [],
            likes: [],
            views: [],
            shares: [],
        });

        await newBlog.save();

        // Send notification asynchronously
        // notifUtil.notifyResourceCreated('blog', newBlog, `/api/blogs/${newBlog._id}`).catch(err =>
            // logger.error('Failed to send blog creation notification:', err)
        // );

        // logger.info(`Blog created: ${newBlog._id} - ${title}`);
        res.status(201).json({
            message: "Blog created successfully",
            blog: { id: newBlog._id, title: newBlog.title }
        });

    } catch (error) {
        // logger.error('Blog creation error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blogs.find()
            .sort({ createdAt: -1 })
            .populate("comments")
            .select('-__v'); // Exclude version field

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found" });
        }

        // logger.info(`Retrieved ${blogs.length} blogs`);
        res.status(200).json(blogs);

    } catch (error) {
        // logger.error('Get blogs error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.getBlogById = async (req, res) => {
    try {
         

        const { id } = req.params;
        const blog = await Blogs.findById(id).populate('comments')
            .populate("comments")
            .select('-__v');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // logger.info(`Blog retrieved: ${id}`);
        res.status(200).json(blog);

    } catch (error) {
        // logger.error('Get blog by ID error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.deleteBlog = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const blog = await Blogs.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Delete associated image from Cloudinary
        if (blog.image && blog.image.public_id) {
             await DeleteImage(blog.image.public_id);
        }

        await Blogs.findByIdAndDelete(id);

        // Send notification asynchronously
        // notifUtil.notifyResourceDeleted('blog', id).catch(err =>
            // logger.error('Failed to send blog deletion notification:', err)
        // );

        // logger.info(`Blog deleted: ${id} - ${blog.title}`);
        res.status(200).json({ message: "Blog deleted successfully" });

    } catch (error) {
        // logger.error('Blog deletion error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.updateBlog = async (req, res) => {
    try {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        // }

        const { id } = req.params;
        const updateData = req.body;
const findPost = await Blogs.findById(id);
        if (!findPost) {
            return res.status(404).json({ message: "Blog not found" });
        }
        if (updateData.image.public_id && findPost.image.public_id && findPost.image.public_id !== updateData.image.public_id) {
            await DeleteImage(findPost.image.public_id);
        }
        const blog = await Blogs.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate("comments");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        

        // Send notification asynchronously
        // notifUtil.notifyResourceUpdated('blog', blog, `/api/blogs/${blog._id}`).catch(err =>
            // logger.error('Failed to send blog update notification:', err)
        // );

        // logger.info(`Blog updated: ${id} - ${blog.title}`);
        res.status(200).json({
            message: "Blog updated successfully",
            blog
        });

    } catch (error) {
        // logger.error('Blog update error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
 
exports.publishBlog = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { id } = req.params;
        const blog = await Blogs.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        blog.status = "published";
        // Set publishedOn if it doesn't exist
        if (!blog.publishedOn) {
            blog.publishedOn = new Date();
        }

        await blog.save();

        // Send notification asynchronously
        // notifUtil.notifySystem('Blog published', `Blog titled "${blog.title}" was published`, `/api/blogs/${blog._id}`).catch(err =>
            // logger.error('Failed to send blog publish notification:', err)
        // );

        // logger.info(`Blog published: ${id} - ${blog.title}`);
        res.status(200).json({
            message: "Blog published successfully",
            publishedOn: blog.publishedOn
        });

    } catch (error) {
        // logger.error('Blog publish error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.likeToggle = async (req, res) => {
    try {
       

        const { blogId } = req.params;
        const { uuid } = req.body;

        const blog = await Blogs.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        let message;
        if (blog.likes.includes(uuid)) {
            blog.likes = blog.likes.filter(id => id !== uuid);
            message = "Blog unliked successfully";
        } else {
            blog.likes.push(uuid);
            message = "Blog liked successfully";
        }

        await blog.save();

        // logger.info(`${message.toLowerCase().replace(' successfully', '')}: ${blogId} by ${uuid}`);
        res.status(200).json({
            message,
            likesCount: blog.likes.length
        });

    } catch (error) {
        // logger.error('Blog like toggle error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
exports.shareToggle = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { blogId } = req.params;
        const { uuid } = req.body;

        const blog = await Blogs.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if already shared by this user
        if (blog.shares.includes(uuid)) {
            return res.status(200).json({
                message: "Blog already shared by this user",
                sharesCount: blog.shares.length
            });
        }

        blog.shares.push(uuid);
        await blog.save();

        // logger.info(`Blog shared: ${blogId} by ${uuid}`);
        res.status(200).json({
            message: "Blog shared successfully",
            sharesCount: blog.shares.length
        });

    } catch (error) {
        // logger.error('Blog share error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
 
exports.saveViews = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Validation errors", errors: errors.array() });
        }

        const { blogId } = req.params;
        const { uuid } = req.body;

        const blog = await Blogs.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if view already exists
        if (blog.views.includes(uuid)) {
            return res.status(200).json({
                message: "Blog view already recorded",
                viewsCount: blog.views.length
            });
        }

        blog.views.push(uuid);
        await blog.save();

        // logger.info(`Blog view recorded: ${blogId} by ${uuid}`);
        res.status(200).json({
            message: "Blog view saved successfully",
            viewsCount: blog.views.length
        });

    } catch (error) {
        // logger.error('Blog save view error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
 }
