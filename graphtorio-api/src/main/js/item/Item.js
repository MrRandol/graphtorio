var mongoose = require('mongoose');  
var ItemSchema = new mongoose.Schema({  
  name: { type: String, required: true },
  label: { type: String, required: true }
});

module.exports = mongoose.model('Item', ItemSchema);