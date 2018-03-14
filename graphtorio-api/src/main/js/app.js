var express = require('express');
var app = express();
var mongoose = require('mongoose');

// *** default config file *** //
var config = require('./default-config.js');

// *** mongoose *** ///
mongoose.connect(config.mongoURI[app.settings.env], function(err, res) {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log(`Connected to ${app.settings.env} Database: ` + config.mongoURI[app.settings.env]);
  }
});

var ItemController = require('./item/ItemController');
app.use('/items', ItemController);

var RecipeController = require('./recipe/RecipeController');
app.use('/recipes', RecipeController);

module.exports = app;