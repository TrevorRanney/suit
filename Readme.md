
# 🕴️ Server Suit 🕴️
* Runs many hosts on a single IP address
* Explicitly serves files
* Interpolates javascript objects into html variables on the server side  
[Check out this example for server side html with variables](/example/complex-data)  

Master branch contains code for version 2.0 (coming soon: added components, forloops, more complex variables, and forward to certificate server) 

Version 1.0.10 is in production - https://www.npmjs.com/package/server-suit

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
This server requires no packages to run just node!
```
npm run router-example
 - localhost:3456
npm run complex-example
 - localhost:4567
```

## Running tests
The tests dependes on these packages to run: (It seems that testcafe has to be install independently from npm i, ¯\\\_(ツ)\_/¯ )  
    "c8": "^7.10.0" <-- code coverage  
    "jasmine": "^3.10.0" <-- unit tests  
    "testcafe": "1.17.1" <-- browser integration tests  
    "concurrently": "^6.4.0" <-- running all tests together  
    
```
npm i
npm i testcafe@1.17.1
npm test
```
Run just the unit test
```
npm run unit
```

Run just the integration tests
```
npm run e2e
```