var Suit = require('../server-suit');
var Logger = require('../lib/logger')

var logger = new Logger("logfilepath");
logger.verboseOn()

function serveStuff(request,response){
    response.end("HELLO WORLD");
}

var server = new Suit();
server.setLogger(logger.logRequest.bind(logger));
server.httpPort = 8888;

server.addHost("localhost:8888", serveStuff); 

server.start();