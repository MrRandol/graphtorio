var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

const logger = require('./utils/logger').create('app')

/* ==============================================
                  INTERNAL ROUTES
=============================================== */

// TODO : handle protection (backend ? reverseproxy ?)
logger.debug("Adding Route /populate")
var populateController = require('./populator/populateController');
app.use('/populate', populateController)

logger.debug("Adding Route /api")
var graphQLController = require('./graphQL/graphQLController');
app.use('/api', graphQLController)

module.exports = app;