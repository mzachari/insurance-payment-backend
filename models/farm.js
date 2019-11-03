const mongoose = require('mongoose');

const farmSchema = mongoose.Schema({
  name: {type: String, required: true},
  location: { type: String, required: true},
  farmerId: {type:String, required:true},
  cropType: {type:String, required:true},
  insurancePlanId: {type:String, required:true}
  //location to be added
});

module.exports = mongoose.model('Farm',farmSchema);
