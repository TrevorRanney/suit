var Suit = require('../server-suit');

function serveStuff(request,response){
    response.end("HELLO WORLD");
}

var logger = {
    logRequest : function(){
        console.log("Logger called")
    }
}

var server = new Suit();
server.setLogger(logger);
server.httpPort = 8888;

server.addHost("localhost:8888", serveStuff); 

server.start();