var _ = require('lodash');
var express = require('express')
var router = express.Router()
var decompress = require('decompress');
var decompressTarxz = require('decompress-tarxz');

const logger = require('../utils/logger').create('PopulateController')
var Parser = require('./Parser')
var DbPopulator = require('./DbPopulator')
var HeadlessFetcher = require('./HeadlessFetcher')

const FACTORIO_VERSION = "0.16.35"

const EXTRACT_PATH = '.\\headless\\' + FACTORIO_VERSION + '\\extract\\'
const OBJECTS_FILES_TO_PARSE = [
  'factorio\\data\\base\\prototypes\\item\\ammo.lua',
  'factorio\\data\\base\\prototypes\\item\\armor.lua',
  'factorio\\data\\base\\prototypes\\item\\capsule.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-ammo.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-armor.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-gun.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-item.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-item-groups.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-mining-tools.lua',
  'factorio\\data\\base\\prototypes\\item\\demo-turret.lua',
  'factorio\\data\\base\\prototypes\\item\\equipment.lua',
  'factorio\\data\\base\\prototypes\\item\\gun.lua',
  'factorio\\data\\base\\prototypes\\item\\item.lua',
  'factorio\\data\\base\\prototypes\\item\\mining-tools.lua',
  'factorio\\data\\base\\prototypes\\item\\module.lua',
  'factorio\\data\\base\\prototypes\\item\\turret.lua',
  'factorio\\data\\base\\prototypes\\equipment\\equipment.lua',
  'factorio\\data\\base\\prototypes\\fluid\\demo-fluid.lua',
  'factorio\\data\\base\\prototypes\\fluid\\fluid.lua'
]

const RECIPES_FILES_TO_PARSE = [
  'factorio\\data\\base\\prototypes\\recipe\\ammo.lua',
  'factorio\\data\\base\\prototypes\\recipe\\capsule.lua',
  'factorio\\data\\base\\prototypes\\recipe\\demo-furnace-recipe.lua',
  'factorio\\data\\base\\prototypes\\recipe\\demo-recipe.lua',
  'factorio\\data\\base\\prototypes\\recipe\\demo-turret.lua',
  'factorio\\data\\base\\prototypes\\recipe\\equipment.lua',
  'factorio\\data\\base\\prototypes\\recipe\\fluid-recipe.lua',
  'factorio\\data\\base\\prototypes\\recipe\\furnace-recipe.lua',
  'factorio\\data\\base\\prototypes\\recipe\\inserter.lua',
  'factorio\\data\\base\\prototypes\\recipe\\module.lua',
  'factorio\\data\\base\\prototypes\\recipe\\recipe.lua',
  'factorio\\data\\base\\prototypes\\recipe\\turret.lua'
]

router.post('/', function (req, res) {
  logger.info("===========================================")
  logger.info("=          FACTORIO DATA PARSING          =")
  logger.info("===========================================")
  logger.info("> STEP 1 : Download headless binary for version %s", FACTORIO_VERSION)
  HeadlessFetcher.downloadHeadless(FACTORIO_VERSION)

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
      temp = await Parser.readFile(EXTRACT_PATH+"\\"+file)
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
      temp = await Parser.readFile(EXTRACT_PATH+"\\"+file)
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