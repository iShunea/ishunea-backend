const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  baseUrl: { type: String, required: true },
  metaKeywords: { type: String, required: true },
  metaDescription: { type: String, required: true },
  blogTitle: { type: String, required: true },
  publishingDate: { type: String, required: true },
  label: { type: String, required: true },
  titleImagePath: { type: String, required: true },
  blogIntro: { type: String, required: true },
  firstSubheadingTitle: { type: String, required: true },
  firstSubheadingFirstText: { type: String, required: true },
  carouselImagePath1: { type: String, required: false },
  carouselImagePath2: { type: String, required: false },
  carouselImagePath3: { type: String, required: false },
  carouselImagePath4: { type: String, required: false },
  firstSubheadingSecondText: { type: String, required: true },
  firstSubheadingImage: { type: String, required: true },
  firstSubheadingImageDescription: { type: String, required: true },
  secondSubheadingTitle: { type: String, required: true },
  secondSubheadingFirstText: { type: String, required: true }
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
