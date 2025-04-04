const User = require("../Models/User");
const jwt = require("jsonwebtoken");


const SECRET_KEY = process.env.JWT_SECRET_KEY;


const generateAuthToken = async (userid, useremail) => {
  try {
    const Token = jwt.sign(
      {  
        id: userid,
        email: useremail,
        iat: Math.floor(Date.now() / 1000), // Issued at: current time in seconds
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      },
      SECRET_KEY
    );
    // console.log("generated>>", Token);
     return Token;
    
     } catch (err) {
    console.log("Auth token Error>>", err);
  }
};

module.exports = generateAuthToken;
