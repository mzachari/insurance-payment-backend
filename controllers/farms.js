const Farm = require('../models/farm');
exports.createFarmerFarm = (req, res, next) => {
  console.log("req", req.body);
  //const url = req.protocol + "://" + req.get("host");
  const farm = new Farm({
    cropType: req.body.cropType,
    location: req.body.location,
    farmerId: req.userData.userId,
    polygonPoints: req.body.polygonPoints
  });
  farm.save().then(result => {
    res.status(201).json({
      message: "Farm added successfully",
      farm: {
        ...result,
        id: result._id
      }
    });
  })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Couldn't add new farm!"
      })
    });
};
exports.getAllFarmerFarms = (req, res, next) =>
{
  farmsQuery = Farm.find()
  .then(farms => {
    res.status(200).json({
      message: 'Farms fetched Successfully',
      farms: farms,
      farmerCount: farms.length
    })
  })
  .catch(err =>{
      res.status(500).json({
        message: "Couldn't fetch farms list!"
    });
  })
};

 exports.getFarmerFarm = (req, res, next) => {
  // Post.findById(req.params.postId).then(post => {
  //   if (post) {
  //     res.status(200).json(post);
  //   } else {
  //     res.status(404).json({
  //       message: 'Post not found!'
  //     })
  //   }
  // })
  //   .catch((error) => {
  //     res.status(500).json({
  //       message: "Couldn't fetch the post!"
  //     })
  //   });
};

exports.editFarmerFarm = (req, res, next) => {
  // let imagePath = req.body.imagePath;
  // if (req.file) {
  //   const url = req.protocol + "://" + req.get("host");
  //   imagePath = url + "/images/" + req.file.filename
  // }
  // const post = new Post({
  //   _id: req.params.id,
  //   title: req.body.title,
  //   content: req.body.content,
  //   imagePath: imagePath
  // });
  // Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
  //   if (result.n > 0) {
  //     res.status(200).json({
  //       message: "Update successful!",
  //       post: result
  //     });
  //   } else {
  //     res.status(401).json({
  //       message: "Not Authorized!"
  //     });
  //   }

  // }).catch((error) => {
  //   res.status(500).json({
  //     message: "Couldn't update post!"
  //   })
  // });
};

exports.deleteFarmerFarm = (req, res, next) => {
  // Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
  //   if (result.n > 0) {
  //     res.status(200).json({
  //       message: "Delete successful!",
  //       post: result
  //     });
  //   } else {
  //     res.status(401).json({
  //       message: "Not Authorized!"
  //     });
  //   }
  // }).catch((error) => {
  //   res.status(500).json({
  //     message: "Couldn't delete post!"
  //   })
  // });
};

exports.addFarmerFarm = (req, res, next) => {
  // Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
  //   if (result.n > 0) {
  //     res.status(200).json({
  //       message: "Delete successful!",
  //       post: result
  //     });
  //   } else {
  //     res.status(401).json({
  //       message: "Not Authorized!"
  //     });
  //   }
  // }).catch((error) => {
  //   res.status(500).json({
  //     message: "Couldn't delete post!"
  //   })
  // });
};
