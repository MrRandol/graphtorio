const Logger = require('logplease')

function create(file) {
  const options = {
    useColors: true,     // Enable colors
    showTimestamp: true, // Display timestamp in the log message
    showLevel: true,     // Display log level in the log message
    filename: null,      // Set file path to log to a file
    appendFile: true,    // Append logfile instead of overwriting
  }
  return Logger.create(file, options)
}

module.exports = {
  create: create
}