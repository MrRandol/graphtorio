const env = process.env.NODE_ENV

// Defaults are basic localhost setup
const config = {
  app: {
    port: parseInt(process.env.GRAPHTORIO_PORT) || 3000
  },
  db: {
    // For now, type only === Neo4J
    type: "Neo4J",
    host: process.env.GRAPHTORIO_DB_HOST || 'bolt://localhost',
    port: parseInt(process.env.GRAPHTORIO_DB_PORT) || 7687,
    name: process.env.GRAPHTORIO_DB_NAME || 'graphtorio',
    user: process.env.GRAPHTORIO_DB_USER || 'graphtorio',
    password: process.env.GRAPHTORIO_DB_PASSWORD || 'graphtorio'
  }
}

module.exports = config