const Crop = require('../models/crops');
exports.getAllCrops = (req,res,next) =>{
    //Returns an array of crops
    cropsQuery = Crop.find()
      .then(crops => {
        res.status(200).json({
          message: 'Crops fetched Successfully',
          crops: crops,
          cropCount: crops.length
        })
      })
      .catch(err =>{
          res.status(500).json({
            message: "Couldn't fetch farmers list!"
        });
      })
  };

  exports.addCrop = (req, res, next) => {
    const crop = new Crop({
        name: req.body.name
    });
    crop.save()
        .then(result => {
        res.status(201).json({
            message: 'Crop Added',
            result: result
        });
        })
        .catch(err => {
        return res.status(500).json({
            message: "Request Failed"
        });
        })
  };