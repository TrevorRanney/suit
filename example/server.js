var Suit = require('../server-suit');

function serveStuff(request,response){
    response.end("HELLO WORLD");
}

function serveDifferentStuff(request,response){
    response.end("XD <3 XD");
}

var server = new Suit();
server.httpPort = 8888;

server.addHost("localhost:8888", serveStuff); 
server.addHost("127.0.0.1:8888", serveDifferentStuff);

server.start();