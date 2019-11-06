const mongoose = require('mongoose');

const cropSchema = mongoose.Schema({
  name: {type: String, required: true}
});

module.exports = mongoose.model('Crops',cropSchema);