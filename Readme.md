
# 🕴️ Server Suit 🕴️

* Runs many hosts on a single IP address
* Explicitly serves files
* Interpolates javascript objects into html variables on the server side

[Check out this example for server side html with variables](/example/complex-data)

```
var Suit = require('server-suit');

var server = new Suit();

serveStuff = (request,response) => {
    response.end("HELLO WORLD");
}

serveDifferentStuff = (request,response) => {
    response.end("XD <3 XD");
}

var router = server.newRouter('testRouter');
router.addRoute('/', serveDifferentStuff);
router.addRoute('/file', "this/could/be/a/path/to/a/file");
router.addRoute('/variables', 'variables.html', {variables} );

server.httpPort = 8888;
server.addHost("localhost:8888", serveStuff); 
server.addHost("127.0.0.1:8888", router.serve);

server.start();
```