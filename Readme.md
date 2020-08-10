
# 🕴️ Server Suit 🕴️

This is a set of tools to run manys hosts on a single IP address


```
var Suit = require('server-suit');

var server = new Suit();

function serveStuff(request,response){
    response.end("HELLO WORLD");
}

function serveDifferentStuff(request,response){
    response.end("XD <3 XD");
}

var router = server.newRouter('testRouter');
router.addRoute('/', serveDifferentStuff);

server.httpPort = 8888;
server.addHost("localhost:8888", serveStuff); 
server.addHost("127.0.0.1:8888", router.serve);

server.start();
```