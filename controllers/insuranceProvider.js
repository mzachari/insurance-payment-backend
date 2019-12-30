const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const InsuranceProvider = require("../models/insuranceProvider");
const fetch = require("node-fetch");
const uuidv1 = require("uuid/v1");


exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    //console.log("token", token.access_token);
    const insuranceProvider = new InsuranceProvider({
      name: req.body.name,
      contactNumber: req.body.contactNumber,
      password: hash,
      email: null,
      imagePath: null,
      state: null,
      district: null
    });
    insuranceProvider
      .save()
      .then(result => {
        res.status(201).json({
          message: "User Created",
          result: result
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          message: "Signup Failed"
        });
      });
  });
};

exports.loginUser = (req, res, next) => {
  let fetchedInsuranceProvider;
  InsuranceProvider.findOne({ contactNumber: req.body.contactNumber })
    .then(insuranceProvider => {
      if (!insuranceProvider) {
        return res.status(401).json({
          message: "Auth failed!"
        });
      }
      fetchedInsuranceProvider = insuranceProvider;
      return bcrypt.compare(req.body.password, insuranceProvider.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed!"
        });
      }
      const token = jwt.sign(
        {
          contactNumber: fetchedInsuranceProvider.contactNumber,
          userId: fetchedInsuranceProvider._id
        },
        "jahd23k13kjbkYs129898qjhwjasaosaknmshryIjnswkejwem3",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedInsuranceProvider._id,
        role: 'insuranceProvider'
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Invalid Credentials"
      });
    });
};

exports.getAllInsuranceProviderDetails = (req, res, next) => {
  //Returns an array of farmer objects
  insuranceProviderQuery = InsuranceProvider.find()
    .then(insuranceProviders => {
      res.status(200).json({
        message: "insuranceProviders fetched Successfully",
        insuranceProviders: insuranceProviders,
        insuranceProviderCount: insuranceProviders.length
      });
    })
    .catch(err => {
      res.status(500).json({
        message: "Couldn't fetch insuranceProviders list!"
      });
    });
};

exports.getInsuranceProviderDetails = (req, res, next) => {
  // console.log("req.userData",req.userData);
  //Returns a farmer object based on farmer id
  InsuranceProvider.findById(req.userData.userId)
    .then(insuranceProvider => {
      if (insuranceProvider) {
        console.log("Request Received", insuranceProvider);
        res.status(200).json({
          message: "insuranceProvider Details Fetched Successfully",
          insuranceProvider: insuranceProvider
        });
      } else {
        res.status(404).json({
          message: "insuranceProvider not found!"
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't fetch insuranceProvider details!"
      });
    });
};

exports.editInsuranceProviderDetails = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const insuranceProvider = new InsuranceProvider({
    _id: req.params.id,
    contactNumber: req.body.contactNumber,
    dateOfBirth: req.body.dateOfBirth,
    imagePath: imagePath,
    state: state,
    district: district
  });

  InsuranceProvider.updateOne(
    { _id: req.params.id, contactNumber: req.userData.contactNumber },
    insuranceProvider
  )
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({
          message: "Update successful!",
          insuranceProvider: result
        });
      } else {
        res.status(401).json({
          message: "Not Authorized!"
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't update InsuranceProvider!"
      });
    });
};
