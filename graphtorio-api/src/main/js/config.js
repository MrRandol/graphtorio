const env = process.env.NODE_ENV

// Defaults are basic localhost setup
const config = {
  app: {
    port: defaultEnvValue("app_port") || 3000
  },
  db: {
    // For now, type only === Neo4J
    type:     "Neo4J",
    host:     defaultEnvValue("db_host")     || 'bolt://localhost',
    port:     defaultEnvValue("db_port")     || 7687,
    name:     defaultEnvValue("db_name")     || 'graphtorio',
    user:     defaultEnvValue("db_user")     || 'graphtorio',
    password: defaultEnvValue("db_password") || 'graphtorio'
  },
  headless: {
    download_dir: defaultEnvValue("headless_download_dir") || './headless/',
    url_template: 'https://www.factorio.com/get-download/%{version}/headless/linux64'
  },
  populator: {
    extract_path: defaultEnvValue("populator_extract_path") || './headless/extract/',
    objects_files_to_parse: [
      'factorio/data/base/prototypes/item/ammo.lua',
      'factorio/data/base/prototypes/item/armor.lua',
      'factorio/data/base/prototypes/item/capsule.lua',
      'factorio/data/base/prototypes/item/demo-ammo.lua',
      'factorio/data/base/prototypes/item/demo-armor.lua',
      'factorio/data/base/prototypes/item/demo-gun.lua',
      'factorio/data/base/prototypes/item/demo-item.lua',
      'factorio/data/base/prototypes/item/demo-item-groups.lua',
      'factorio/data/base/prototypes/item/demo-mining-tools.lua',
      'factorio/data/base/prototypes/item/demo-turret.lua',
      'factorio/data/base/prototypes/item/equipment.lua',
      'factorio/data/base/prototypes/item/gun.lua',
      'factorio/data/base/prototypes/item/item.lua',
      'factorio/data/base/prototypes/item/mining-tools.lua',
      'factorio/data/base/prototypes/item/module.lua',
      'factorio/data/base/prototypes/item/turret.lua',
      'factorio/data/base/prototypes/equipment/equipment.lua',
      'factorio/data/base/prototypes/fluid/demo-fluid.lua',
      'factorio/data/base/prototypes/fluid/fluid.lua'
    ],
    recipes_files_to_parse: [
      'factorio/data/base/prototypes/recipe/ammo.lua',
      'factorio/data/base/prototypes/recipe/capsule.lua',
      'factorio/data/base/prototypes/recipe/demo-furnace-recipe.lua',
      'factorio/data/base/prototypes/recipe/demo-recipe.lua',
      'factorio/data/base/prototypes/recipe/demo-turret.lua',
      'factorio/data/base/prototypes/recipe/equipment.lua',
      'factorio/data/base/prototypes/recipe/fluid-recipe.lua',
      'factorio/data/base/prototypes/recipe/furnace-recipe.lua',
      'factorio/data/base/prototypes/recipe/inserter.lua',
      'factorio/data/base/prototypes/recipe/module.lua',
      'factorio/data/base/prototypes/recipe/recipe.lua',
      'factorio/data/base/prototypes/recipe/turret.lua'
    ]
  }
}

function defaultEnvValue(paramName) {
  return process.env["GRAPHTORIO_" + paramName.toUpperCase()]
}

module.exports = config