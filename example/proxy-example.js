var Suit = require('../server-suit');
var HttpProxy = require('../lib/http-proxy');

var proxy = new HttpProxy('localhost', 3332)

console.log(proxy2.getHost());

var server = new Suit();
server.httpPort = 8002;
server.addHost("localhost:8002", proxy); 

server.start();