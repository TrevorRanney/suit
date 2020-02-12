var Suit = require('../server-suit');
var Proxy = require('../lib/proxy');

var proxy = new Proxy('betterfoodorder.com', 80)
var proxy2 = new Proxy('localhost', 8888)



console.log(proxy2.getHost());

var server = new Suit();
server.httpPort = 8002;

server.addHost("localhost:8002", proxy); 
server.addHost("127.0.0.1:8002", proxy2);

server.start();