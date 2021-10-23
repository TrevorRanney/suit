
# 🕴️ Server Suit 🕴️

* Runs many hosts on a single IP address
* Explicitly serves files
* Interpolates javascript objects into html variables on the server side

[Check out this example for server side html with variables](/example/complex-data)

## Code example:
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
var variables = { thing: { stuff: ['XD']}, thing2: "thing2" };
//<div>${variables.things.stuff[0]} </div> <--found in variables.html
//will apear as <div>XD</div> to the client
router.addRoute('/variables', 'variables.html', {variables} );

server.httpPort = 8888;
server.addHost("localhost:8888", serveStuff); 
server.addHost("127.0.0.1:8888", router.serve);

server.start();
```

## Running the server
Download this repo and run these commands to see examples of the server.  
This server require no packagesto run just node! (Last tested on v14.15.3)
```
npm run router-example
 - localhost:3456
npm run complex-example
 - localhost:4567
```

## Running tests
```
npm i
npm test
```
