const fs = require('fs')
var _ = require('lodash')

const logger = require('../utils/logger').create('Parser')

function readFile(filePath){
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, 'utf8', function(err, data) { 
      if (err) {
        reject(err)
      }
      resolve(getObjectsWithWrapper(data, ""))
    })
  })
}

function getObjectsWithWrapper(data) {
  var buffer = ""
  var inDataExports = false
  var char
  var level = 0

  // TODO : continue after end - see modules definitions (funtion in the middle of 2)

  //logger.debug("Getting data-extend wrapper")
  for (var i = 0; i < data.length; i++) {
    char = data[i]
    if ( inDataExports ) {
      if ( char === "}" && level === 0) {
        inDataExports = false
        break
      }
      if ( char === "{" ) {
        level++
      }
      if ( char === "}") {
        level--
      }

      buffer += char
    } else {
      if ( char === "{" ) {
        inDataExports = true
      }
    }
  }
  return getObjectsWithoutWrapper(buffer)
}


function getObjectsWithoutWrapper(objectsString) {
  if ( !objectsString.includes("{") && !objectsString.includes("}")) {
    //logger.debug("Received buffer with no brackets. Assuming it is only 1 object.")
    return [parseObject(objectsString)]
  }

  var buffer = ""
  var objects = []
  var level = 0

  for (var i = 0; i < objectsString.length; i++) {
    char = objectsString[i]
    if (char === "{") {
      if (level > 0) {
        buffer += char
      }
      level++
    } else if ( char === "}" ) {
      if ( level === 1 ) {
        //logger.debug("Got object string. Parsing it.")
        var o = parseObject(_.trim(buffer))
        if ( o ) {
          //logger.debug("Adding object : ")
          //logger.debug(JSON.stringify(o))
          objects.push(o)
        } else {
          logger.warn("\t\tWARNING : Could not parse object string.")
          logger.warn("\t\tSee current buffer.")
          logger.warn("\t\t---------------- BUFFER START ----------------")
          console.log(buffer)
          logger.warn("\t\t---------------- BUFFER END ----------------")
        }
        buffer = ""
        level = 0
      } else if ( level > 1 ) {
        buffer += char
        level--
      } else {
        logger.error("\t\tERROR : we are below level 1 of parsing.")
        logger.error("\t\tThis should not happen. see current buffer.")
        logger.error("\t\t---------------- BUFFER START ----------------")
        console.log(buffer)
        logger.error("\t\t---------------- BUFFER END ----------------")
      }
    } else {
      if ( level > 0 ) {
        buffer += char
      }
    }
  }
  //logger.debug("File parsed, adding the following objects :")
  //logger.debug(JSON.stringify(objects))
  return objects
}


function parseObject(inputString) {
  var objectString = inputString + "\n"
  var buffer = ""
  var subObjectBuffer = ""
  var level = 0
  var tmp
  var isInComment = false
  var returnObject = {}

  //logger.debug("STARTING TO PARSE OBJECT")
  for (var i = 0; i < objectString.length; i++) {
    char = objectString[i]
    if ( char === "\n" || i === objectString.length - 1 ) {
      if ( level === 0 ) {
        if ( buffer.includes("{") || buffer.includes("}") ) {
          if ( subObjectBuffer != "" ) {
            //logger.debug("   [/S] " + buffer)
            subObjectBuffer += buffer + "\n"
            tmp = parseSubObject(subObjectBuffer)
            returnObject[tmp.key] = tmp.value
            subObjectBuffer = ""
          } else {
            //logger.debug("   [OS] " + buffer)
            tmp = parseSubObject(buffer)
            returnObject[tmp.key] = tmp.value
          }
        } else {
          let split = _.trim(buffer).split("=")
          if ( buffer.includes("=") && (!split[1] || split[1] === "") ) {
            subObjectBuffer = buffer
            //logger.debug("   [\\S] " + buffer)
          } else {
            buffer = _.trim(buffer)
            if (buffer != "") {
              //logger.debug("   [O] " + buffer)
              tmp = parseObjectProperty(buffer)
              for (var entry of tmp) {
                returnObject[entry.key] = entry.value
              }
            }
          }
        }
      } else {
        //logger.debug("   [S%s] %s", level, buffer)
        subObjectBuffer += buffer + "\n"
      }
      buffer = ""
      isInComment = false
    } else {
      if ( char === '{' ) {
        level++
      } else if ( char === '}' ) {
        level--
      }
      if ( char === '-' && buffer.slice(-1) === '-') {
        buffer = buffer.slice(0, -1)
        isInComment = true
      } else {
        buffer += char
      }
    }
  }
  //logger.debug("END OF OBJECT PARSING")
  return returnObject
}

function parseSubObject(inputString) {
  //logger.debug("    Parsing sub object")
  var subObjectString = _.trim(inputString)
  var split = subObjectString.split("=")
  if (split.length === 1) {
    //logger.debug("    Sub Object is a single object, parsing the value as object")
    var bracketsRemoved = subObjectString.substring(subObjectString.indexOf('{') + 1, subObjectString.lastIndexOf('}'))
    var o = {}
    var tmp = parseObjectProperty(_.trim(bracketsRemoved))
    for (var t of tmp) {
      o[t.key] = t.value
    }
    return o
  } else {
    var split0 = cleanValue(split.shift())
    var split1 = split.join("=")
    //logger.debug("    Sub object has a key prop (%s), parsing the value as key/value pair", split0)
    var isValueArray = isSubObjectValueArray(split1)
    var bracketsRemoved = split1.substring(split1.indexOf('{') + 1, split1.lastIndexOf('}'))
    var value
    if (isValueArray) {
      //logger.debug("    Sub object value is an array")
      value = getObjectsWithoutWrapper(bracketsRemoved)
    } else if (split0 === "flags") {
      //logger.debug("    Key is flags parsing as array anyway")
      value = getObjectsWithoutWrapper(bracketsRemoved)
    } else {
      //logger.debug("    Sub object value is a simple object")
      value = parseObject(bracketsRemoved)
    }
    return { key: split0, value: value}
  }
}

function parseObjectProperty(line) {
  //logger.debug("    Parsing object property line : %s", line)
  var split = _.trim(line).split("=")
  if ( split.length === 2 ) {
    var o = [{key: cleanValue(split[0]), value: cleanValue(split[1])}]
    //logger.debug("    returning %s", JSON.stringify(o))
    return o
  } else if ( split.length === 1 ) {
    var o = []
    for (elem of line.split(",")) { 
      elem = _.trim(elem)
      if (isNumber(elem)) {
        o.push({key: "amount", value: cleanValue(elem)})
      } else if (_.isString(elem)) {
        o.push({key: "name", value: cleanValue(elem)})
      } else {
        logger.error("    \t\tERROR : Could not parse object property")
        logger.error("    \t\tThis should not happen. see current buffer.")
        logger.error("    \t\t---------------- BUFFER START ----------------")
        console.log(    line)
        logger.error("    \t\t---------------- BUFFER END ----------------")
        return []
      }
    }
    //logger.debug("    returning %s", JSON.stringify(o))
    return o
  } else {
    var o = []
    for ( var p of line.split(",") ) {
     o = _.concat(o, parseObjectProperty(p))
    }
    //logger.debug("    returning %s", JSON.stringify(o))
    return o
  }
}

function isSubObjectValueArray(subObject) {
  var gotOpeningBracket = false
  for (var i = 0; i < subObject.length; i++) {
    char = subObject[i]
    switch( char ) {
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        continue
        break
      case '{':
        if (gotOpeningBracket)
          return true
        else
          gotOpeningBracket = true
        break

      default:
        if ( !gotOpeningBracket ) {
          logger.error("    \t\tERROR : Trying to detect subObject value type but string does not start with {")
          logger.error("    \t\tThis should not happen. see current buffer.")
          logger.error("    \t\t---------------- BUFFER START ----------------")
          console.log(subObject)
          logger.error("    \t\t---------------- BUFFER END ----------------")
        } 
        return false
    }
  }
}

function isNumber(n) {
  return /^\d+$/.test(n)
}

function cleanValue(string) {
  return _.trim(string).replace(/"/g, '').replace(/,/g, '')
}

module.exports = {
  readFile: readFile
}