const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Farmer = require('../models/farmer');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      console.log("User CReated1")
      const farmer = new Farmer({
        email: req.body.email,
        password: hash
      });
      farmer.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created',
            result: result
          });
        })
        .catch(err => {
          return res.status(401).json({
            message: "Signup Failed"
          });
        })
    })
};

exports.loginUser = (req, res, next) => {
  let fetchedFarmer;
  Farmer.findOne({ email: req.body.email })
    .then(farmer => {
      if (!farmer) {
        return res.status(401).json({
          message: "Auth failed!"
        })
      }
      fetchedFarmer = farmer;
      return bcrypt.compare(req.body.password, farmer.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed!"
        })
      }
      const token = jwt.sign(
        { email: fetchedFarmer.email, farmerId: fetchedFarmer._id },
        "jahd23k13kjbkYs129898qjhwjasaosaknmshryIjnswkejwem3",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        expiresIn: 3600,
        farmerId: fetchedFarmer._id
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    });
};

exports.getAllFarmersDetails = (req,res,next) =>{
  //Returns an array of farmer objects
  farmersQuery = Farmer.find()
    .then(farmers => {
      res.status(200).json({
        message: 'Farmers fetched Successfully',
        farmers: farmers,
        farmerCount: farmers.length
      })
    })
    .catch(err =>{
        res.status(500).json({
          message: "Couldn't fetch farmers list!"
      });
    })
};

exports.getFarmerDetails = (req,res,next) =>{
  //Returns a farmer object based on farmer id
  Farmer.findById(req.params.farmerId).then(farmer => {
    if (farmer) {
      res.status(200).json(farmer);
    } else {
      res.status(404).json({
        message: 'Farmer not found!'
      })
    }
  })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't fetch farmer details!"
      })
    });
};

exports.editFarmerDetails = (req,res,next)=>{
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const farmer = new Farmer({
    _id: req.params.id,
    contactNumber: req.body.contactNumber,
    dateOfBirth: req.body.dateOfBirth,
    imagePath: imagePath,
    state:state,
    district:district
  });


  Farmer.updateOne({_id:req.params.id,email:req.userData.emaAil},farmer).then(result =>{
    if(result.n>0){
      res.status(200).json({
        message: "Update successful!",
        farmer: result
      });
    }
    else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }
  }).catch((error) => {
    res.status(500).json({
      message: "Couldn't update farmer!"
    })
  });
}
