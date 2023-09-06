
# 🕴️ Server Suit 🕴️
* Runs many hosts on a single IP address
* Explicitly serves files
* Interpolates javascript objects into html variables on the server side  
[Check out this example for server side html with variables](/example/complex-data) 
* Load components 

### Install:
``` 
npm i server-suit 
```

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
var variables = { things: { stuff: ['XD']}, thing2: "thing2" };
router.addRoute('/variables', 'variables.html', {variables} );
// HTML file: <div>{{variables.things.stuff[0]}}</div>
// will apear as <div>XD</div> to the client

server.httpPort = 8888;  
server.addHost("localhost:8888", serveStuff);  
server.addHost("127.0.0.1:8888", router.serve);    


server.start();
```
## Components
Components can be loaded in an html file like this:
``` [[/path-to-file.html]] ```

## Running the example servers
Download this repo and run these commands to see examples of the server.  
This server requires no packages to run just node!
```
npm run router-example
 - localhost:3456
npm run complex-example
 - localhost:4567
```

## Running tests
The tests dependes on these packages to run  
    c8  
    jasmine  
    testcafe  
    concurrently
    
```
npm i
npm test
```
Run just the unit test
```
npm run unit
```

Run just the e2e tests
```
npm run e2e
```
