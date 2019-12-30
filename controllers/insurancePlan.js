const Policy = require('../models/insurancePlan');
exports.createProviderPolicy = (req, res, next) => {
  console.log("req", req.body);
  //const url = req.protocol + "://" + req.get("host");
  const policy = new Policy({
    premiumPercentage: req.body.premiumPercentage,
    providerId: req.userData.userId,
    durationDays: req.body.durationDays,
    policyName: req.body.policyName,
    minimumAmount: req.body.minimumAmount
  });
  policy.save().then(result => {
    res.status(201).json({
      message: "policy added successfully",
      policy: {
        ...result,
        id: result._id
      }
    });
  })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Couldn't add new policy!"
      })
    });
};
exports.getAllProviderPolicy = (req, res, next) =>
{
  policyQuery = Policy.find({providerId: req.userData.userId})
  .then(policyList => {
    res.status(200).json({
      message: 'Policies fetched Successfully',
      policyList: policyList,
      policyCount: policyList.length
    })
  })
  .catch(err =>{
      console.log(err);
      res.status(500).json({
        message: "Couldn't fetch policy list!"
    });
  })
};

exports.getAllPolicy = (req, res, next) =>
{
    policyQuery = Policy.find()
    .then(policyList => {
      res.status(200).json({
        message: 'Policies fetched Successfully',
        policyList: policyList,
        policyCount: policyList.length
      })
    })
    .catch(err =>{
        res.status(500).json({
          message: "Couldn't fetch policy list!"
      });
    })
};

