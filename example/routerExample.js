var Suit = require('../server-suit');
var server = new Suit();
server.httpPort = 3456;

var variable1 = variable2 = "XD";
var router = server.newRouter('testRouter');
router.addRoute('/', 'test.html', {variable1, variable2} );
router.addRoute('/function', (_,response) => {response.end(`XD <3 ${variable1}`);});

server.addHost("localhost:3456", router.serve); 
server.start();