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

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const farmSchema = mongoose.Schema({
  location: { type: String, required: true},
  farmerId: {type:String, required:true},
  cropType: {type:String, required:true},
  insurancePlanId: {type:String},
  polygonPoints : polygonSchema 
});



module.exports = mongoose.model('Farm',farmSchema);
