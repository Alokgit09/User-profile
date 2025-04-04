const Blog = require("../Models/Blog");

const searchPostbySlug = async (req, res) => {
  try {
    const keyword = req.params.slug;
    const blogPosts = await Blog.find({ $text: { $search: keyword } });

    if (blogPosts.length === 0) {
      return res.status(404).json({ message: "Blog posts not found" });
    }

    res.status(200).json(blogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = searchPostbySlug;
