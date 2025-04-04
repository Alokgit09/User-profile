const { response } = require("express");
const Blog = require("../Models/Blog");
const fs = require("fs");
const path = require("path");
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');


const blogImagesPath = path.join(__dirname, "../blogImages");

const createBlogsbyAdmin = async (req, res) => {
  let imageUrl = null; // Declare imageUrl at the beginning
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    imageUrl = req.file.filename;
    const authorId = req.user.id; // Assuming req.user contains the authenticated admin's ID
    
    const slug = slugify(req.body.heading, {
      lower: true,      // convert to lower case, defaults to `false`
      strict: false,     // strip special characters except replacement, defaults to `false`
    });

    const id = uuidv4(); // Generate a unique identifier
    const slugWithid = `${slug}${id}`

    const postData = {
      slug: slugWithid,
      heading: req.body.heading,
      content: req.body.content,
      image: `/${imageUrl}`,
      categories: req.body.categories,
      author: authorId, // Assign the author ID to the blog post
    };

    const newPost = new Blog(postData);
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (err) {
    // If an error occurs, delete the uploaded image
    if (imageUrl && fs.existsSync(path.join(blogImagesPath, imageUrl))) {
      fs.unlinkSync(path.join(blogImagesPath, imageUrl));
    }
    return res.status(401).json({ message: err.message });
  }
};


const updatePostbyadmin = async (req, res) => {
  const { id } = req.params;
  try{
    const findbyId = await Blog.findById(id);
    console.log(findbyId);
    if(!findbyId){
      res.status(404).json({ message: "Admin not found" });
    }

    blogUpdate = {};
    if(req.body.heading) blogUpdate.heading = req.body.heading;
    if(req.body.content) blogUpdate.content = req.body.content;
    if(req.body.categories) blogUpdate.categories = req.body.categories;
    
    if(req.file){
      blogUpdate.image = `/${req.file.filename}`;
      if(findbyId.image){
        const oldImage = path.join(blogImagesPath, findbyId.image);
        fs.unlink(oldImage, (err) => {
          if(err){
            console.log('Error deleting old image:', err);
          }else{
            console.log('Old image successfully deleted:', oldImage);
          }
        });
      }
      const options = { new: true, runValidators: true };
      if(Object.keys(blogUpdate).length > 0){
      const updateBlog = await Blog.findByIdAndUpdate( id, blogUpdate, options );
      res.status(201).json(updateBlog);
      }else{
        res.status(400).json({ message: "Blog has not Updated" });
      }
    };
  }catch(err){
    return res.status(401).json({ message: err.message });
  }
};


const deleteBlogadmin = async (req, res) => {
  const { id } = req.params;
  try{
    if(!id){
      res.status(404).json({ message: "id not found" });
    }
    const idData = await Blog.findById(id);
    const deleteBlog = await Blog.findByIdAndDelete(id);
    if(idData.image){
     const imageDelete = path.join(blogImagesPath, idData.image);
     if(fs.existsSync(imageDelete)){
      fs.unlinkSync(imageDelete);
      console.log("Image deleted Successfully");
     }else{
      console.log("mage path not found");
     }
    }
    res.status(200).json({ message: "Blog deleted successfully", Blog: deleteBlog });
  }catch(err){
    return res.status(401).json({ message: err.message });
  }

};


module.exports = {
  createBlogsbyAdmin,
  updatePostbyadmin,
  deleteBlogadmin,
};
