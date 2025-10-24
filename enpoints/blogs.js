const express = require('express');
const router = express.Router();
const { uploadBlogs, updateObjectWithUploadedFiles } = require('../handleImage');
const Blog = require('../schemas/blog');
const path = '/images/blogs/';

// POST route for blogs
router.post('/blogs', uploadBlogs.any(), async (req, res) => {
    try {
        const blogData = { ...req.body };

        await updateObjectWithUploadedFiles(req, blogData, path);

        const newBlog = new Blog(blogData);
        await newBlog.save();

        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        res.status(500).json({ message: 'Error saving blog', error });
        console.error('Error:', error);
    }
});

// GET route to retrieve all blogs
router.get('/blogs', async (req, res) => {
    try {
      const blogs = await Blog.find(); // Fetch all blogs from the database
  
      if (!blogs || blogs.length === 0) {
        return res.status(404).json({ message: 'No blogs found' });
      }
  
      res.status(200).json(blogs); // Send all blogs as JSON response
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving blogs', error });
      console.error('Error:', error);
    }
  }
);

// GET route to retrieve all blogs
router.get('/blogs/tags', async (req, res) => {
  try {
      // Use projection to retrieve only the necessary fields
      const uniqueTags = await Blog.distinct('label');

      res.status(200).json(uniqueTags);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving blogs tags', error });
      console.error("Error: ", error);
  }
});

// GET route to retrieve all blogs for services page
router.get('/admin/blogs/list', async (req, res) => {
  try {
      // Use projection to only retrieve 'id' and 'jobTitle' fields
      const blogs = await Blog.find({}, 'id jobTitle');

      // Use .map() to efficiently transform the result
      const returnBlogs = blogs.map(({ id }) => ({ id }));

      res.status(200).json(returnBlogs);
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving blogs', error });
      console.error("Error: ", error);
  }
});

// GET route to retrieve a single blog by ID
router.get('/blogs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findOne({ id: id });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving the blog', error });
    console.error("Error: ", error);
  }
}
);
  
// GET route to retrieve a single blog by ID
router.get('/admin/edit/blogs/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const blog = await Blog.findOne({ id: id });
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      res.status(200).json(blog);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving the blog', error });
      console.error("Error: ", error);
    }
  }
);

// PUT route to update an blog
router.put('/admin/edit/blogs/:id', uploadBlogs.any(), async (req, res) => {
  const { id } = req.params;
  try {
    const blogData = { ...req.body };

    await updateObjectWithUploadedFiles(req, blogData, path);
    
    const updatedService = await Blog.findOneAndUpdate({ id: id }, blogData, { new: true });

    if (!updatedService) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog updated successfully', blog: updatedService });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error });
    console.error('Error:', error);
  }
});

// DELETE route to delete a blog
router.delete('/admin/blogs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBlog = await Blog.findOneAndDelete({ id: id });

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully', blog: deletedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error });
    console.error('Error:', error);
  }
});

module.exports = router;