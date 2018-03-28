var express = require('express');
var app = express();
var mongoose = require('mongoose');

// *** default config file *** //
var config = require('./default-config.js');

const logger = require('./utils/logger').create('app')

// *** mongoose *** ///
/*mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log(`Connected to ${app.settings.env} Database: ` + config.mongoURI[app.settings.env]);
  }
});*/

var ItemController = require('./item/ItemController');
logger.debug("Adding Route /items")
app.use('/items', ItemController);

var RecipeController = require('./recipe/RecipeController');
logger.debug("Adding Route /recipes")
app.use('/recipes', RecipeController);

var populateController = require('./populator/populateController');
logger.debug("Adding Route /populate")
app.use('/populate', populateController);

module.exports = app;