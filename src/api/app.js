
'use strict';

const restify = require('restify'),
      data = require('./prepare-data')
      ;

function home(req, res, next) {
  res.send(data.get());
  next();
}

var server = restify.createServer();
server.use(restify.bodyParser());

server.get('/', home);

server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
