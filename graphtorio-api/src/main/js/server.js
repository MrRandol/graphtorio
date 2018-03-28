var app = require('./app');
var port = process.env.PORT || 3000;

const logo = require('asciiart-logo');


var server = app.listen(port, function() {

  console.log(
    logo({
      name: 'Graphtorio',
      font: 'univers',
      lineChars: 15,
      padding: 5,
      margin: 2
    })
    .emptyLine()
    .right("Listening on port " + port)
    .emptyLine()
    .wrap('Ready to Automate the world !')
    .render()
  );

  //console.log('[' + process.env.NODE_ENV + '] Express server listening on port ' + port);
});