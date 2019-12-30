const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const insuranceProviderSchema = mongoose.Schema({
  name: {type: String, required: true},
  password: { type: String, required: true},
  contactNumber: {type:String, required:true,unique: true}
});

insuranceProviderSchema.plugin(uniqueValidator);

module.exports = mongoose.model('InsuranceProvider',insuranceProviderSchema);
