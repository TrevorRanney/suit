var Suit = require('../../server-suit');
var server = new Suit();
server.httpPort = 4567;


var complexVariable = {
    stuff: ['world','hello'],
    things: { stuff: ['XD']},
    user: {videos: [{description: "video1", mp4:"data"},{description: "v2"}]}
};

var router = server.newRouter('complexe data router');
// router.setBaseRoute('./example/complex-data');
router.addRoute('/', 'complex.html', complexVariable );

server.addHost("localhost:4567", router.serve); 
server.start();