const mongoose = require('mongoose');

const polygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true
  }
});

const insuranceSchema = mongoose.Schema({
  premiumPercentage :{type:Number,required:true},
  insuredAmount : {type:Number,required:true},
  insurancePlanNumber : {type:String,required:true},
  insuranceStartDate : { type : Date ,required:true},
  insuranceEndDate : { type : Date ,required:true},
  farmId : {type:String, required:true},
  insuredLocation : polygonSchema,
  insuranceProvider : {type:String,required:true}, // example ICICI Lombard Policy

});



module.exports = mongoose.model('insurance',insuranceSchema);
