const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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
  location: { type: String},
  name: { type: String, unique: true},
  farmerId: {type:String, required:true},
  cropType: {type:String, required:true},
  area: {type: Number},
  startDate: {type: Date},
  endDate: {type: Date},
  insurancePlanId: {type:String},
  polygonPoints : polygonSchema 
});
farmSchema.plugin(uniqueValidator);



module.exports = mongoose.model('Farm',farmSchema);
