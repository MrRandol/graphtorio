const neo4j = require('neo4j-driver').v1
var _ = require('lodash')
const logger = require('../utils/logger').create('Neo4JController')

function getItemRecipe(name){
  logger.debug("Getting Item with name %s", name)

  const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("graphtorio", "graphtorio"));
  const session = driver.session();

  let request = "MATCH (item:Item { name:'" + name + "' })<-[produces:PRODUCES]-(recipe:Recipe)-[consumes:CONSUMES]->(ingredient:Item) RETURN item, produces, recipe, consumes, ingredient"
  //let request = "MATCH path=(:Item { name:'" + name + "' })<-[:PRODUCES]-()-[:CONSUMES]->() RETURN path"
  
  logger.debug(" >>>>> Cypher request <<<<< ")
  logger.debug(request)
  logger.debug(" >>>>> End cypher request <<<<< ")
  return session.run(request)
  .then(result => {
    session.close()
    driver.close()
    logger.debug(" >>>>> Request result <<<<< ")
    logger.debug(JSON.stringify(result.records))
    logger.debug(" >>>>> End request result <<<<< ")

    var items = []
    var ingredients = []
    var produces = []
    var consumes = []
    var recipes = []
    

    var tmp
    for (let record of result.records) {
      addIfAbsent(record, 'item', items)
      addIfAbsent(record, 'ingredient', ingredients)
      addIfAbsent(record, 'produces', produces)
      addIfAbsent(record, 'consumes', consumes)
      addIfAbsent(record, 'recipe', recipes)
    }

    return {
      items,
      ingredients,
      produces,
      consumes,
      recipes
    }
  })
  .catch(error => {
    logger.error("Error while fetching item with name %s", name)
    logger.error("\t\t---------------- STACK START ----------------")
    console.log(error)
    logger.error("\t\t---------------- STACK END ----------------")
    throw(error)
  });
}

function addIfAbsent(record, key, collection) {
  var rec = record.get(key)
  var tmp = _.assign({}, rec.properties, {id: rec.identity.toNumber()})
  if (rec.end && rec.start) {
    tmp = _.assign(tmp, {end: rec.end.toNumber()}, {start: rec.start.toNumber()})
  }
  if ( _.findIndex(collection, (o) => {return o.id === tmp.id})===-1 ) {
    collection.push(tmp)
  }
}




module.exports = { getItemRecipe }