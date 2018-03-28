var fs = require('fs');
var url = require('url');
var https = require('https');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
const logger = require('../utils/logger').create('HeadlessFetcher')

let DOWNLOAD_DIR = '.\\headless\\';

function downloadHeadless(version){
  var file_url = 'https://www.factorio.com/get-download/' + version + '/headless/linux64';
  var download_dir = DOWNLOAD_DIR + version
  return new Promise( function(resolve, reject) {
    if (fs.existsSync(download_dir)) {
      logger.debug("%s exists, cleaning it first.", DOWNLOAD_DIR )
      exec('rm -rf ' + DOWNLOAD_DIR, function(err, stdout, stderr) {
        if (err) reject(err)
        else resolve(createFolderAndDownload(download_dir, file_url))
      })
    } else {
      resolve(createFolderAndDownload(download_dir, file_url))
    }
  })
}

function createFolderAndDownload(download_dir, file_url) {
  return new Promise(function(resolve, reject) {
    // Create download folder
    logger.debug("creating folder " +download_dir )
    exec('mkdir ' + download_dir, function(err, stdout, stderr) {
      if (err) reject(err)
      else resolve(download_file_httpget(download_dir, file_url))
    })
  })
}

// Function to download file using HTTP.get
function download_file_httpget (download_dir, file_url) {
  return new Promise(function(resolve, reject) {
    var file_name = download_dir + "\\headless.tar.xz"
    logger.debug("fetching " + file_url)
    exec('curl --insecure -L -o ' + file_name + ' ' + file_url, function(err, stdout, stderr) {
      if (err) reject(err)
      else {
        logger.debug("File %s has been downloaded", file_name)
        resolve(file_name);
      } 
    })
  })
}

module.exports = {
  downloadHeadless
}