const jwt = require("jsonwebtoken")
const User = require("../models/user.model.js")



const verifyJWT = async (req, res, next) => {

  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized request",
      });
    }
  
    const decodeToken = await jwt.verify(token,process.env.access_token_secret)
  
   const user =  await User.findById(decodeToken?._id)
  
    if(!user)
    {
      return res.status(404).json({
          message : "Invalid Access Token"
      })
    }


    req.user = user;
    
    next();

  } catch (error) {
    res.status(401).json({
        message : "Invalid Access Token"
    })
  }
};



module.exports = verifyJWT
