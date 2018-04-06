const logo = require('asciiart-logo');

const config = require('./config')
var app = require('./app');

var server = app.listen(config.app.port, function() {
  console.log(
    logo({
      name: 'Graphtorio',
      font: 'speed',//'univers',
      lineChars: 15,
      padding: 5,
      margin: 2
    })
    .emptyLine()
    .right("Listening on port " + config.app.port)
    .emptyLine()
    .wrap('Ready to Automate the world automation !')
    .render()
  );
});