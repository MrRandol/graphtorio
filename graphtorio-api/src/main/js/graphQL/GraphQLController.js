var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var dbController = require('./Neo4JController')

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    item(name: String!): Item
  }

  type Item {
    id: ID,
    name: String,
    stack_size: Int,
    type: String,
    icon: String
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  item: function ({name}) {
    return dbController.getItem(name)
    .then((result) => {

      console.log("RESULT : %s", JSON.stringify(result))
      return result
    })
  }
}

module.exports = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
})