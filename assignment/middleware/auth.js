const jwt = require("jsonwebtoken");

//authentication and authoriaztion middleware~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~``

const Auth = async function (req, res, next) {
  try {
    const authHeader = req.header("Authorization", "Bearer Token");
 
    if (!authHeader) {
      res
        .status(401)
        .send({ status: false, Message: "authentication token is missing." });
    } else {
      let tokenindex = authHeader.split(" ")[1];
    
      let decodedtoken = jwt.verify(tokenindex, "Dp2022");
    
      if (decodedtoken) {
        req.user = decodedtoken;
    
        next();
      }
    }
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.Auth = Auth;

