const express = require("express");
const { createBlog, updateBlog, deleteBlog, getAllBlogs, getSingleBlog, getBlogById } = require("../controllers/blogController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
const upload = require('../middleware/multer');

// Route for creating a new blog (with image upload)
router.route("/admin/blog/new").post(isAuthenticatedUser, authorizeRoles("Admin"), upload.single('image'), createBlog);

// Route for updating a blog
router.route("/admin/blog/update/:id").put(isAuthenticatedUser, authorizeRoles("Admin"),upload.single('image'), updateBlog);

// Route for deleting a blog
router.route("/admin/blog/delete/:id").delete(isAuthenticatedUser, authorizeRoles("Admin"), deleteBlog);

// Route for fetching all blogs
router.route("/blogs").get(isAuthenticatedUser, getAllBlogs);

// Route for fetching blog by its ID
router.route("/admin/blog/:id").get(isAuthenticatedUser, authorizeRoles("Admin"), getBlogById);

module.exports = router;
