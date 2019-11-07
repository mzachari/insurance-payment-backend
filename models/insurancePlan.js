const mongoose = require('mongoose');

var redeemConditionsSchema = new mongoose.Schema({
  conditions : {type : String , required : true},
});

const insurancePlanSchema = mongoose.Schema({
  premiumPercentage :{type:Number,required:true},
  durationDays : {type:Number,required:true},
  policyName : {type:String,required:true}, // Example ICICI Lombard
  termsAndConditions : {type:String},
  minimumAmount :{type:Number,required:true},
  redeemConditions:[redeemConditionsSchema]

});



module.exports = mongoose.model('insurance',insurancePlanSchema);
