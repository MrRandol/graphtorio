const neo4j = require('neo4j-driver').v1;
var _ = require('lodash');
const logger = require('../utils/logger').create('DBPopulator')

function addObjects(objects){
  logger.debug("Starting objects inserts")
  return insertObjects(objects)
  logger.debug("Objects inserts done")
}

function insertObjects(objects) {
  if (!objects ||objects.length == 0) {
    return null
  }
  let object = objects.shift()
  let label = _.chain(object.type).camelCase().upperFirst()
  const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("graphtorio", "graphtorio"));
  const session = driver.session();
  let requestSubString = ''
  let requestParams = {}
  for ( let key of _.keys(object) ) {
    if ( key !== 'type' && (_.isNumber(object[key]) || _.isString(object[key])) ) {
      requestSubString += key +': $' + key + ','
      requestParams[key] = object[key]
    }
  }
  requestSubString = _.truncate(requestSubString, {'length': requestSubString.length - 1, 'omission': ''})
  logger.debug("Creating object %s in label %s", object.name, label)
  let request = 'CREATE (:' + label + ' {' + requestSubString + '})'
  //console.log("Making request : " + request)
  //console.log(JSON.stringify(requestParams))
  return session.run( request, requestParams)
  .then(result => {
    session.close()
    driver.close()
    return insertObjects(objects)
  })
  .catch(error => {
    logger.error("Error while creating Node")
    logger.error("\t\t---------------- STACK START ----------------")
    console.log(error)
    logger.error("\t\t---------------- STACK END ----------------")
    throw(error)
  });
}

function addRecipes(recipes){
  logger.debug("Starting recipes inserts")
  return insertRecipes(recipes)
  logger.debug("Recipes inserts done !")
}

function insertRecipes(recipes) {
  if (!recipes ||recipes.length == 0) {
    return null
  }
  let recipe = recipes.shift()
  let ingredients = recipe.normal ? recipe.normal.ingredients : recipe.ingredients
  return insertOneRecipe(recipe, ingredients)
  .then(() => {
    return insertRecipes(recipes)
  })
}

function insertOneRecipe(recipe, ingredients) {
  var result = recipe.normal ? recipe.normal.result : recipe.result
  if ( !result ) {
    result = recipe.normal ? recipe.normal.results : recipe.results
  }
  if ( !_.isArray(result) ) {
    result = [result]
  }
  return createRelationshipsNN(recipe, result, ingredients)
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

module.exports = {
  addObjects,
  addRecipes
}