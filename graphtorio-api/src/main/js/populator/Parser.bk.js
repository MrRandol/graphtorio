const fs = require('fs')
var _ = require('lodash')

function readFile(filePath){
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', function(err, data) { 
      // Return 500 with error in case of any failure
      if (err) {
        reject(err)
      }
      
      var lines = data.split("\n")
      console.log(lines.length)

      resolve(findWrappingDataExtend(lines))
    })
  })
}

function findWrappingDataExtend(lines) {
  if ( !lines || lines.length == 0) {
    console.log("--- End of lines (should not be this one) ---")
    return null
  }
  var line = lines.shift()

  if ( line.includes('data:extend') ) {
    console.log("Found data:extend")
    if ( line.includes('{') ) {
      console.log("WARNING ! Wrapping bracket is included in line - handle recursion properly for this case.")
      return []
    } else {
      console.log("Going to parse objects...")
      return parseObjects(lines, 0, [], {})
    }
  } else {
    console.log("no luck on data:extend, continuing...")
    return findWrappingDataExtend(lines)
  }
}

function parseObjects(lines, level, objs, object, subObjectType) {
  var objects = objs.slice(0)
  if ( !lines || lines.length == 0) {
    console.log("End of lines (should not happen)")
    return objects
  }

  var line = lines.shift()
  if (line.trim() == "" || line.trim().includes("--", 0)) {
    return parseObjects(lines, level, objects, object, subObjectType)
  }

  if ( line.includes("{") ) {
    if ( level === 0 ) {
      //console.log("Found all objects opening bracket")
      level = 1
    } else if ( level == 1 ) {
      //console.log("  ".repeat(level) + "Entering object definition")
      level = 2
    } else if ( line.includes("}") ) {
        //console.log("  ".repeat(level) + "inline subObject. No level adjustment")
        if (subObjectType === "ingredients" || subObjectType === "results") {
          //console.log("parsing result")
          //console.log(line)
          var cleanedLine = _.replace(line.trim(), '"', '').split('{')[1].split('}')[0].split(',')
          var result = {}
          for (let elem of cleanedLine) {
            var split = elem.split("=")
            result[elem[0].trim()] = split[1].trim()
          }
          object[subObjectType].push(result)
        }
    } else if ( subObjectType === "ingredients" || subObjectType === "results" ) {
        //console.log("  ".repeat(level) + "entering " + subObjectType + " definition of recipe")
        //should not touch level fo this case (in order to get in line parsing)
    } else {
      //console.log("  ".repeat(level) + "Entering object subObject")
      level++
    }
    return parseObjects(lines, level, objects, object, subObjectType)
  } else if ( line.includes("}") ) {
    if ( level <= 0 ) {
      console.log("ERROR : below level 0 - this case should not happen")
      return null
    } else if (level === 1) {
      //console.log("Found all objects closing bracket")
      //No need to reset level, we are out of pertinent data
      return objects
    } else if ( level == 2 ) {
      if ( subObjectType === "ingredients" || subObjectType === "results" ) {
        //console.log("  ".repeat(level) + "leaving " + subObjectType + " definition of recipe")
        subObjectType = ""
      } else {
        level = 1
        //console.log("  ".repeat(level) + "Leaving object definition")
        objects.push(object)
        object = {}
      }
    } else {
      level --
      //console.log("  ".repeat(level) + "Leaving object subObject")
    }
    return parseObjects(lines, level, objects, object, subObjectType)
  } else {
    if ( level <= 0 ) {
      console.log("Outside objects (should not happen)")
    } else if ( level == 1 ) {
      console.log("Between object (should not happen)")
    } else {
      if ( level == 2 ) {
        //console.log("  ".repeat(level) + "OBJECT")
        var s = line.split("=")
        if ( s && s.length === 2 ) {
          let key = s[0].trim()
          if (object.type === "recipe" && (key === "ingredients" || key === "results")) {
            //console.log("starting to fill recipe " + key)
            object[key] = []
            subObjectType = key
          } else {
            object[key] = cleanValue(s[1])
          }
        } else {
          if (line.trim().includes("--", 0)) {
            console.log("Ignoring comment line")
          } else {
            console.log("Error while parsing object")
            console.log(line) 
          }
        }
      } else {
        //console.log("  ".repeat(level) + "SUB OBJECT")
      }
    }
    return parseObjects(lines, level, objects, object, subObjectType)
  }
}

function cleanValue(string) {
  return string.trim().replace(/"/g, '').replace(/,/g, '')
}

module.exports = {
  readFile: readFile
}