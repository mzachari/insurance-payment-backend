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
  premiumPercentage :{type:Number,required:function() { return this.isFormComplete === 3; } },
  insuredAmount : {type:Number,required:function() { return this.isFormComplete === 3; }},
  insurancePlanNumber : {type:String,required:function() { return this.isFormComplete === 3; }},
  insuranceStartDate : { type : Date ,required:function() { return this.isFormComplete === 3; }},
  insuranceEndDate : { type : Date ,required:function() { return this.isFormComplete === 3; }},
  farmId : {type:String},
  insuredLocation : polygonSchema,
  insuranceProvider : {type:String,required:function() { return this.isFormComplete === 3; }}, // example ICICI Lombard Policy
  isFormComplete : {type:Number},
  farmerId: {type:String, required:true},
  imagePath: {type:String},
  insuranceId: {type: String}

});



module.exports = mongoose.model('insurance',insuranceSchema);
