var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var dbController = require('./Neo4JController')

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    item_recipe(name: String!): ItemRecipe
  }

  type ItemRecipe {
    items: [Item],
    ingredients: [Item],
    recipes: [Recipe],
    produces: [craftLink],
    consumes: [craftLink]
  }

  type Item {
    id: ID,
    name: String,
    stack_size: Int,
    type: String,
    icon: String
  }

  type Recipe {
    id: ID,
    name: String,
    energy_normal: String,
    energy_expensive: String
  }

  type craftLink {
    id: ID,
    amount: Int,
    cost: String,
    start: ID,
    end: ID
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  item_recipe: function ({name}) {
    return dbController.getItemRecipe(name)
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