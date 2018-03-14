module.exports.validItem = function() {
  let id = Math.random().toString(36).substr(2, 5)
  return {
    name: 'item_' + id,
    label: 'Item Label'
  };
};
 