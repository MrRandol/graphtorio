var express = require('express');
var app = express();

const logger = require('./utils/logger').create('app')

/* ==============================================
                  INTERNAL ROUTES
=============================================== */

// TODO : handle protection (backend ? reverseproxy ?)
var populateController = require('./populator/populateController');
logger.debug("Adding Route /populate")
app.use('/populate', populateController);

module.exports = app;