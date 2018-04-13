const neo4j = require('neo4j-driver').v1;
var _ = require('lodash');
const logger = require('../utils/logger').create('DBPopulator')

const config = require('../config').db
const db_url = config.host + ':' + config.port
const db_user = config.user
const db_password = config.password

/***************************
            ITEMS
***************************/
function addItems(items){
  logger.debug("Starting items inserts (%s)", items.length)
  return insertItems(items, 1)
}

function insertItems(items, count) {
  if ( !items || items.length == 0 ) {
    return null
  }

  let item = items.shift()
  const driver = neo4j.driver(db_url, neo4j.auth.basic(db_user, db_password));
  const session = driver.session();

  let request = 'CREATE (:Item ' + paramsToString(item) + ')'
  //console.log("REQUEST : %s", request)
  //console.log("REQUEST PARAMS : %s", JSON.stringify(requestParams))
  return session.run( request, item )
  .then(result => {
    session.close()
    driver.close()
    return insertItems(items, count+1)
  })
  .catch(error => {
    logger.error("Error while creating item Node")
    throw(error)
  });
}

/***************************
          RECIPES
***************************/
function addRecipes(recipes){
  logger.debug("Starting recipes inserts")
  return insertRecipes(recipes)
}

function insertRecipes(recipes) {
  if (!recipes ||recipes.length == 0) {
    return null
  }
  let recipe = recipes.shift()
  return insertOneRecipe(recipe)
  .then(() => {
    return insertRecipes(recipes)
  })
}

function insertOneRecipe(recipe) {
  const driver = neo4j.driver(db_url, neo4j.auth.basic(db_user, db_password));
  const session = driver.session();

  var energy_normal = 0.5
  if (recipe.normal && recipe.normal.energy_required)
    energy_normal = recipe.normal.energy_required
  else if (recipe.energy_required)
    energy_normal = recipe.energy_required
  var energy_expensive = energy_normal
  if (recipe.expensive && recipe.expensive.energy_required)
    energy_expensive = recipe.expensive.energy_required

  let params = {
    name: recipe.name,
    energy_normal: energy_normal,
    energy_expensive: energy_expensive
  }
  let request = "CREATE (:Recipe " + paramsToString(params) + ")"

  return session.run( request, params )
  .then(result => {
    session.close()
    driver.close()
    return result
  })
  .then(() => {
    //Link product(s)
    var r = recipe.normal ? recipe.normal : recipe
    if ( r.result ) {
      insertOneResult(recipe.name, r.result, r.result_count)
    } else if ( r.results ) {
      insertMultipleResults(recipe.name, r.results)
    } else {
      throw ("Recipe has no resulting product !")
    }
  })
  .then(() => {
    //link ingredient(s)
    var r = recipe.normal ? recipe.normal : recipe
    insertMultipleIngredients(recipe.name, r.ingredients)
  })
  .catch(error => {
    logger.error("Error while creating recipe Node")
    throw(error)
  });
}

function insertMultipleResults(recipeName, results) {
  if ( !results || results.length === 0 ){
    return null
  }
  var result = results.shift()
  return insertOneResult(recipeName, result.name, result.amount)
  .then(() => {
    return insertMultipleResults(recipeName, results)
  })
}

function insertOneResult(recipeName, resultName, amount) {
  const driver = neo4j.driver(db_url, neo4j.auth.basic(db_user, db_password));
  const session = driver.session();

  let request = "MATCH (a:Recipe),(b:Item) " +
    "WHERE a.name = '" + recipeName +"' AND b.name = '" + resultName + "'" +
    "CREATE (a)-[r:PRODUCES {" +
      "amount: " + (amount || 1) + ", " + 
      "cost: 'normal'" +
    "}]->(b)" +
    "RETURN a, b"

  return session.run( request )
  .then(result => {
    session.close()
    driver.close()
    return result
  })
}

function insertMultipleIngredients(recipeName, ingredients) {
  if ( !ingredients || ingredients.length === 0 ){
    return null
  }
  var ingredient = ingredients.shift()
  return insertOneIngredient(recipeName, ingredient.name, ingredient.amount)
  .then(() => {
    return insertMultipleIngredients(recipeName, ingredients)
  })
}

function insertOneIngredient(recipeName, ingredientName, amount) {
  const driver = neo4j.driver(db_url, neo4j.auth.basic(db_user, db_password));
  const session = driver.session();

  if (!amount) {
    logger.warn("Ingredient %s from recipe %s is undefined. Default to 1.", ingredientName, recipeName)
  }

  let request = "MATCH (a:Recipe),(b:Item) " +
    "WHERE a.name = '" + recipeName +"' AND b.name = '" + ingredientName + "'" +
    "CREATE (a)-[r:CONSUMES {" +
      "amount: " + (amount || 1) + ", " + 
      "cost: 'normal'" +
    "}]->(b)" +
    "RETURN a, b"

  return session.run( request )
  .then(result => {
    session.close()
    driver.close()
    return result
  })
}

function paramsToString(p) {
  var requestString = '{'
  var keys =  _.keys(p)
  var params = {}

  if ( !keys || keys.length === 0 ) {
    return ''
  } 

  for ( let key of keys ) {
    var value = p[key]
    if ( _.isNumber(value) || _.isString(value) ) {
      requestString += key +': $' + key + ','
      params[key] = value
    }
  }

  requestString = _.truncate(requestString, {'length': requestString.length - 1, 'omission': ''})
  requestString += '}'

  return requestString
}


module.exports = {
  addItems,
  addRecipes
}
















function createRelationshipsNN(recipe, results, ingredients) {
  if ( !results || results.length <= 0 ) {
    return Promise.resolve()
  }

  let result = results.shift()
  return createRelationships1N(recipe, result, ingredients)
  .then(() => {
    return createRelationshipsNN(recipe, results, ingredients)
  })

}

function createRelationships1N(recipe, result, _ingredients) {
  if ( !_ingredients || _ingredients.length <= 0 ) {
    return Promise.resolve()
  }
  var ingredients = _.clone(_ingredients)
  let ingredient = ingredients.shift()
  var energy_required
  // distinction is being made between normal & expensive. Model is not the same
  if (recipe.normal) {
    energy_required = recipe.normal.energy_required ? ", enery_required: " + recipe.normal.energy_required : ""
  } else {
    energy_required = recipe.energy_required ? ", enery_required: " + recipe.energy_required : ""
  }

  var result_amount = 1
  var result_name = result

  if ( !_.isString(result) ) {
    result_amount = result.amount ? result.amount : 1
    result_name = result.name
  }

  logger.debug("Creating relation between %s(%s) and %s(%s)", result_name, result_amount, ingredient.name, ingredient.amount)
  //logger.debug("Still to insert : %s", JSON.stringify(ingredients))
  const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("graphtorio", "graphtorio"));
  const session = driver.session();
  let request = "MATCH (a),(b) " +
    "WHERE a.name = '" + result_name +"' AND b.name = '" + ingredient.name + "'" +
    "CREATE (a)-[r:RECIPE {" +
      "amount: " + ingredient.amount + ", " + 
      "result_amount: " + result_amount + ", " + 
      "name: '" + recipe.name + "'" +
      energy_required +
    "}]->(b)" +
    "RETURN a, b"
  return session.run(request)
  .then(() => {
      session.close()
      driver.close()
      return createRelationships1N(recipe, result, ingredients)
    })

  .catch(error => {
    logger.error("Error while creating Relationship")
    logger.error("\t\t---------------- RECIPE START ----------------")
    logger.error(recipe)
    logger.error("\t\t---------------- RECIPE END ----------------")
    logger.error("\t\t---------------- STACK START ----------------")
    console.log(error)
    logger.error("\t\t---------------- STACK END ----------------")
    throw(error)
  });
}

