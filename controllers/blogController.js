const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Blog = require("../models/blogModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const dotenv = require('dotenv');

dotenv.config({ path: "config/config.env" });

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// Multer configuration to handle file uploads
const storage = multer.memoryStorage();  // Use memory storage for file buffering
const upload = multer({ storage: storage }).single('image');

// Create a new blog
exports.createBlog = catchAsyncErrors(async (req, res, next) => {
    // Step 1: Check if the user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated",
        });
    }

    let imageDetails = {};  // To store image information for the blog

    // Step 2: Handle image upload if a file is provided
    if (req.file) {
        // Check if file is empty or missing important fields
        if (!req.file.buffer || req.file.size === 0) {
            return next(new ErrorHandler('Empty file uploaded!', 400));
        }

        try {
            // Upload image to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'blogs' },  // The folder in Cloudinary
                    (error, result) => {
                        if (error) {
                            reject(new ErrorHandler('Image upload failed!', 500));
                        }
                        resolve(result); // Resolve with the result
                    }
                ).end(req.file.buffer);  // Pass the file buffer directly to Cloudinary
            });

            // Set image details if upload was successful
            imageDetails = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            console.log("Image uploaded successfully:", imageDetails); // Log image upload details

        } catch (error) {
            console.error("Error during Cloudinary upload:", error); // Log error during upload
            return next(error);
        }
    } else {
        // No file uploaded
        return res.status(400).json({
            success: false,
            message: "No file uploaded. Please upload an image.",
        });
    }

    // Step 3: Create the blog post with or without image details
    try {
        const blog = await Blog.create({
            title: req.body.title,
            body: req.body.body,
            image: imageDetails ? [imageDetails] : [],  // Store image details if available
            user: req.user._id,  // Set the authenticated user's ID
        });

        // Step 4: Return the created blog post as a response
        res.status(201).json({
            success: true,
            blog,
        });
    } catch (error) {
        console.error("Error creating blog:", error); // Log any errors during blog creation
        return next(error);
    }
});



// Update a blog
exports.updateBlog = catchAsyncErrors(async (req, res, next) => {
    const blogId = req.params.id;
    const { title, body } = req.body;

    // Find the blog to update
    const blog = await Blog.findById(blogId);

    if (!blog) {
        return next(new ErrorHandler(`Blog not found with ID: ${blogId}`, 404));
    }

    // Ensure the user is the owner of the blog
    if (blog.user.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to update this blog", 403));
    }

    // Update the blog details
    blog.title = title || blog.title;
    blog.body = body || blog.body;

    // Handle image upload if new image is provided
    if (req.file) {
        try {
            // Upload the new image to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'blogs' },  // The folder in Cloudinary
                    (error, result) => {
                        if (error) {
                            reject(new ErrorHandler('Image upload failed!', 500));
                        }
                        resolve(result);  // Resolve with the result
                    }
                ).end(req.file.buffer);  // Pass the file buffer directly to Cloudinary
            });

            // Update the image URL and public_id in the blog
            blog.image = [{
                public_id: result.public_id,
                url: result.secure_url,
            }];

        } catch (error) {
            console.error("Error during Cloudinary upload:", error);  // Log error
            return next(error);  // Pass the error to the error handler
        }
    }

    // Save the updated blog
    await blog.save();

    // Respond with the updated blog
    res.status(200).json({
        success: true,
        blog,
    });
});


// Delete a blog
exports.deleteBlog = catchAsyncErrors(async (req, res, next) => {
    const blogId = req.params.id;

    // Find the blog to delete
    const blog = await Blog.findById(blogId);

    if (!blog) {
        return next(new ErrorHandler(`Blog not found with ID: ${blogId}`, 404));
    }

    // Ensure the user is the owner of the blog
    if (blog.user.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to delete this blog", 403));
    }

    await Blog.deleteOne({ _id: blogId });

    res.status(200).json({
        success: true,
        message: "Blog deleted successfully!",
    });
});

// Get all blogs (with title, image, id, and pagination)
exports.getAllBlogs = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;  // Default to page 1 if not provided
    const limit = parseInt(req.query.limit, 10) || 10;  // Default to 10 blogs per page if not provided

    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
        .skip(skip)
        .limit(limit)
        .select("title image _id body createdAt")  // Select only the fields you need
        .populate("user", "firstName lastName userName");  // Optionally populate user info

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
        success: true,
        blogs,
        totalBlogs,
        totalPages,
        currentPage: page,
    });
});

// Get a blog by ID
exports.getBlogById = catchAsyncErrors(async (req, res, next) => {
    const blogId = req.params.id;

    // Step 1: Find the blog by its ID
    const blog = await Blog.findById(blogId).populate("user", "firstName lastName userName");

    // Step 2: If no blog found, return 404 error
    if (!blog) {
        return next(new ErrorHandler(`Blog not found with ID: ${blogId}`, 404));
    }

    // Step 3: Return the blog details
    res.status(200).json({
        success: true,
        blog,
    });
});

