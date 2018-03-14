module.exports.validItem = function() {
  let id = Math.random().toString(36).substr(2, 5)
  return {
    name: 'item_' + id,
    label: 'Item Label'
  };
};
 
module.exports.recipeNoIngredient = function() {
  let id = Math.random().toString(36).substr(2, 5)
  return {
    name: 'recipe_' + id,
    label: 'Recipe Label'
  };
};
 