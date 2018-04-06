var _ = require('lodash')
var express = require('express')
var router = express.Router()
var decompress = require('decompress')
var decompressTarxz = require('decompress-tarxz')
var path = require('path')

const config = require('../config').populator
const logger = require('../utils/logger').create('PopulateController')
var Parser = require('./Parser')
var DbPopulator = require('./DbPopulator')
var HeadlessFetcher = require('./HeadlessFetcher')

const EXTRACT_PATH = config.extract_path
const OBJECTS_FILES_TO_PARSE = config.objects_files_to_parse
const RECIPES_FILES_TO_PARSE = config.recipes_files_to_parse

router.post('/', function (req, res) {
  logger.info("===========================================")
  logger.info("=          FACTORIO DATA PARSING          =")
  logger.info("===========================================")

  if ( !req.body ) {
    throw("This endpoint requires parameters (TODO : see doc)")
  }
  var factorio_version = req.body.version
  if ( !factorio_version || factorio_version.trim() === "" ) {
    throw("Parameter version is mandatory")
  }

  logger.info("> STEP 1 : Download headless binary for version %s", factorio_version)
  HeadlessFetcher.downloadHeadless(factorio_version)

  .then((filename) => { 
    logger.info("> STEP 2 : Extract archive data")
    logger.debug("\tFile : %s", filename)
    logger.debug("\tFiles will be decompressed in %s", EXTRACT_PATH)
    return decompress(filename, EXTRACT_PATH, {
      plugins: [
        decompressTarxz()
      ]
    })
  })

  .then(async function() {
    logger.info("> STEP 3 : Parse items definitions")
    var objects = []
    var length = OBJECTS_FILES_TO_PARSE.length
    var counter = 1
    var temp
    logger.debug("\tWe have %s file(s) to parse", length)
    for (let file of OBJECTS_FILES_TO_PARSE) {
      logger.info("\t[%s/%s] %s ", counter, length, file)
      temp = await Parser.readFile(path.resolve(EXTRACT_PATH, file))
      logger.debug(`\tParsed : %s item(s) `, temp.length)
      objects = _.concat(objects, temp)
      counter++
    }
    logger.info("\tFinished parsing items files")
    logger.debug("Got a total of %s objects", objects.length)
    return objects
  })

  .then(function(objects) {
    logger.info("> STEP 4 : Insert objects into database")
    return DbPopulator.addObjects(objects)
  })

  .then(async function() {
    logger.info("> STEP 5 : Parse recipes definitions")
    var recipes = []
    var length = RECIPES_FILES_TO_PARSE.length
    var counter = 1
    var temp
    logger.debug("\tWe have %s file(s) to parse", length)
    for (let file of RECIPES_FILES_TO_PARSE) {
      logger.info("\t[%s/%s] %s ", counter, length, file)
      temp = await Parser.readFile(path.resolve(EXTRACT_PATH, file))
      logger.debug(`\tParsed : %s recipe(s) `, temp.length)
      recipes = _.concat(recipes, temp)
      counter++
    }
    logger.info("\tFinished parsing recipes files")
    logger.debug("Got a total of %s objects", recipes.length)
    return recipes
  })

  .then(function(recipes) {
    logger.info("> STEP 6 : Insert recipes into database")
    return DbPopulator.addRecipes(recipes)
  })

  .then(function() {
    logger.info("> STEP 7 : All done, returning OK")
    res.status(200).send("OK");
  })

  .catch((error) => {
    logger.error("ERROR DURING POPULATE - returning 500")
    logger.error("-------------------------------- STACK START --------------------------------")
    console.log(error)
    logger.error("-------------------------------- STACK END --------------------------------")
    res.status(500).send("ERROR DURING POPULATE")
  })
});

module.exports = router;