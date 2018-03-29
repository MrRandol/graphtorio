var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

const logger = require('./utils/logger').create('app')

/* ==============================================
                  INTERNAL ROUTES
=============================================== */

// TODO : handle protection (backend ? reverseproxy ?)
var populateController = require('./populator/populateController');
logger.debug("Adding Route /populate")
app.use('/populate', populateController);

module.exports = app;