const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const farmerSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  password: { type: String, required: true},
  contactNumber: {type:String, required:true},
  dateOfBirth: {type:String, required: true},
  imagePath : {type: String, required: true},
  state: {type:String},
  district: {type:String}
});

farmerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Farmer',farmerSchema);
