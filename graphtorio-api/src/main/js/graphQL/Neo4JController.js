const neo4j = require('neo4j-driver').v1
var _ = require('lodash')
const logger = require('../utils/logger').create('Neo4JController')

function getItem(name){
  logger.debug("Getting Item with name %s", name)

  const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("graphtorio", "graphtorio"));
  const session = driver.session();


  let request = "MATCH (i:Item{name:'" + name + "'}) RETURN i"
  logger.debug(" >>>>> Cypher request <<<<< ")
  logger.debug(request)
  logger.debug(" >>>>> End cypher request <<<<< ")
  return session.run(request)
  .then(result => {
    session.close()
    driver.close()
    logger.debug(" >>>>> Request result <<<<< ")
    logger.debug(result.records[0].get(0).properties)
    logger.debug(" >>>>> End request result <<<<< ")
    return result.records[0].get(0).properties
  })
  .catch(error => {
    logger.error("Error while fetching item with name %s", name)
    logger.error("\t\t---------------- STACK START ----------------")
    console.log(error)
    logger.error("\t\t---------------- STACK END ----------------")
    throw(error)
  });
}


module.exports = { getItem }