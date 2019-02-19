var Suit = require('../server-suit');

function serveStuff(request,response){
    response.end("HELLO WORLD");
}

var server = new Suit();
server.httpPort = 8888;

server.addHost("127.0.0.1:8888", serveStuff);
server.addHost("localhost:8888", serveStuff); 

server.start();