const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const generateAuthToken = require("../Controllers/GenerateToken");
const jwt = require("jsonwebtoken");
const transporter = require("../E-Mail/mailConfig");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const destinationPath = path.join(__dirname, "../uploads");
const SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});


// Helper function to generate email template
const generateEmailTemplate = (verificationUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Email Verification</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
   
      <p>Thank you!</p>
    </div>
  `;
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:2020/token?token=${token}`;
  const mailOptions = {
    from: SMTP_USER,
    to: email,
    subject: 'Email Verification',
    html: generateEmailTemplate(verificationUrl),
  };

  return transporter.sendMail(mailOptions);
};

const verifyToken = async (req, res) => {
  const {token} = req.query;
  console.log("token>>>", token);
  try {
    const verified = jwt.verify(token, SECRET_KEY);  
    const issuedAt = verified.iat;
    const expiresAt = verified.exp;

    // Convert Unix timestamps to Date objects
    const issuedAtDate = new Date(issuedAt * 1000); // Multiply by 1000 to convert to milliseconds
    const expiresAtDate = new Date(expiresAt * 1000);     
    res.status(201).json({ message: 'Your E-mail has been Verifyed successfully'});
    // console.log("verifyToken", issuedAtDate, expiresAtDate);
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

const userSignedup = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const imageUrl = req.file.filename;
  const email = req.body.email;

  try {
    // Check if the email already exists
    const checkMail = await User.findOne({ email: email });
    if (checkMail) {
      fs.unlinkSync(path.join(destinationPath, imageUrl));
      return res.status(400).json({ message: "Email already exists" });
    }
 
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    console.log("JWTtoken>>", token);

    await sendVerificationEmail(email, token);
    const userData = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // Note: Hash the password before storing it
      profileIcon: `/${imageUrl}`,
    });

    await userData.save();
    res.status(201).json({
      message: "User registered successfully. Verification email sent.",
      user: userData,
    });
  } catch (err) {
    if (fs.existsSync(path.join(destinationPath, imageUrl))) {
      fs.unlinkSync(path.join(destinationPath, imageUrl));
    }
    res.status(500).json({ message: err.message });
  }
};

const userLogedIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const checkmail = await User.findOne({ email });
    if (checkmail) {
      // Compare provided password with stored hashed password
      const checkPassword = await bcrypt.compare(password, checkmail.password);
      if (checkPassword) {
        const userid = checkmail._id;
        const useremail = checkmail.email;
        // Generate JWT token
        const token = await generateAuthToken(userid, useremail);

        const mailToken = { email: useremail, Token: token };
        // console.log("mailToken>>", mailToken);
        return res.status(201).json(mailToken);
      } else {
        console.log("Please Enter Valid Password");
        return res.status(400).json({ message: "Please Enter Valid Password" });
      }
    } else {
      console.log("Please Enter Valid E-mail");
      return res.status(400).json({ message: "Please Enter Valid E-mail" });
    }
  } catch (err) {
    console.log("Error during login>>", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  verifyToken,
  upload,
  userSignedup,
  userLogedIn,
};
