var mongoose = require('mongoose');

var RecipeSchema = new mongoose.Schema({  
  name: { type: String, required: true },
  label: { type: String, required: true },
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});
mongoose.model('Recipe', RecipeSchema);

module.exports = mongoose.model('Recipe');