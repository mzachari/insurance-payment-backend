const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, 'jahd23k13kjbkYs129898qjhwjasaosaknmshryIjnswkejwem3');
  //console.log("decodedToken",decodedToken);
  req.userData = {userId: decodedToken.userId, email: decodedToken.contactNumber};
  next();
  }
  catch (err) {
    console.log("req1",error);
    res.status(401).json({
      message: "You are not authenticated!"
    });
  }
}
