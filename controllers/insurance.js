const Insurance = require('../models/insurance');
exports.createFarmerInsurance = (req, res, next) => {
  console.log("req", req.body);
  const url = req.protocol + "://" + req.get("host");
  const insurance = new Insurance({
    farmerId: req.userData.userId,
    isFormComplete: 1,
    imagePath: url + "/insurance-plan-images/" + req.file.filename,
  });
  insurance.save().then(result => {
    res.status(201).json({
      message: "Insurance add step1 completed successfully",
      insurance: {
        ...result,
        id: result._id
      }
    });
  })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Couldn't add new insurance!"
      })
    });
};
exports.getAllFarmerInsurances = (req, res, next) =>
{
  insuranceQuery = Insurance.find()
  .then(results => {
    res.status(200).json({
      message: 'Insurances fetched Successfully',
      insurances: results,
      insurancesCount: results.length
    })
  })
  .catch(err =>{
      res.status(500).json({
        message: "Couldn't fetch Insurance list!"
    });
  })
};

 exports.getFarmerInsurance = (req, res, next) => {
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

exports.editFarmerInsurance = (req, res, next) => {
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

exports.deleteFarmerInsurance = (req, res, next) => {
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
