var Suit = require('../server-suit');

serveStuff = (request,response) => {
    response.end("HELLO WORLD");
}

serveDifferentStuff = (request,response) => {
    response.end("XD <3 XD");
}

var server = new Suit();
server.httpPort = 8888;

server.addHost("localhost:8888", serveStuff); 
server.addHost("127.0.0.1:8888", serveDifferentStuff);

// function noProxyForRequest(request,response)
// {
//     var ip = request.headers['x-forwarded-for'] ||
//         request.connection.remoteAddress ||
//         request.socket.remoteAddress ||
//         (request.connection.socket ? request.connection.socket.remoteAddress : null);

//     console.log("request from",ip,"is not mapped:", request.headers.host, request.url);
// }

// server.setNoHostHandler(noProxyForRequest);

server.start();