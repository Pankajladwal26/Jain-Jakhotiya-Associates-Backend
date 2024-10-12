const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter Blog Title"],
    },
    body: {
      type: String,
      required: [true, "Please enter Blog Content"],
    },
    image: [
        {
            public_id:{
                type: String,
            },
            url:{
                type: String,
            }
        }
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Reference to the User model who created the blog
      required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema);
