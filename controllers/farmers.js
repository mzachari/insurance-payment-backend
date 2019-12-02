const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Farmer = require('../models/farmer');
const fetch = require('node-fetch');
const uuidv1 = require('uuid/v1');
const axios = require('axios');
const qs =  require('qs');

const AUTHORITY = 'https://login.microsoftonline.com/theelderwandtechgmail.onmicrosoft.com';
const WORKBENCH_API_URL = 'https://elderwand-7e32bo-api.azurewebsites.net';
const RESOURCE = '81a86dbe-b0df-4058-853e-523927cccaf6';
const CLIENT_APP_Id = '7ed6ca0e-da17-4e07-a088-80bfd50c377f';
const CLIENT_SECRET = 'sropS+6zxXRZ0SICyfpZfATXJoR2ssdxS2hxP1IXL4I=';


const acquireTokenWithClientCredentials = async (resource, clientId, clientSecret, authority) => {
  const requestBody = {
    resource: resource,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  };

  const response = await axios({
    method: 'POST',
    url: `${authority}/oauth2/token`,
    data: qs.stringify(requestBody),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
}

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      console.log(req)
      var guid=uuidv1();
      acquireTokenWithClientCredentials(RESOURCE, CLIENT_APP_Id, CLIENT_SECRET, AUTHORITY).then(
        (token)=>{
        //  console.log("token", token.access_token);
          const body={"externalID":guid,"firstName":req.body.name,"lastName":req.body.contactNumber,"emailAddress":req.body.name+"@gmail.com"};
          fetch("https://elderwand-7e32bo-api.azurewebsites.net/api/v1/users",{method:'POST',body:JSON.stringify(body),
                headers: {"Content-Type":"application/json","Authorization":`Bearer ${token.access_token}`}}).then(respAzure=>respAzure.json)
                .then(azureJson=>console.log(azureJson));

        });
      //console.log("token", token.access_token);
        const farmer = new Farmer({
          name: req.body.name,
          contactNumber: req.body.contactNumber,
          password: hash,
          email: null,
          imagePath: null,
          state: null,
          district: null
        });
        farmer.save()
        .then(result => {
          res.status(201).json({
            message: 'User Created',
            result: result
          });
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({
            message: "Signup Failed"
          });
        })
    })
};

exports.loginUser = (req, res, next) => {
  let fetchedFarmer;
  Farmer.findOne({ contactNumber: req.body.contactNumber })
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
        { contactNumber: fetchedFarmer.contactNumber, userId: fetchedFarmer._id },
        "jahd23k13kjbkYs129898qjhwjasaosaknmshryIjnswkejwem3",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedFarmer._id
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
 // console.log("req.userData",req.userData);
  //Returns a farmer object based on farmer id
  Farmer.findById(req.userData.userId).then(farmer => {
    if (farmer) {
      console.log("Request Received", farmer);
      res.status(200).json({
        message: 'Farmer Details Fetched Successfully',
        farmer:farmer});
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


  Farmer.updateOne({_id:req.params.id,contactNumber:req.userData.contactNumber},farmer).then(result =>{
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
