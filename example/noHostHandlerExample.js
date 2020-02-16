var Suit = require('../server-suit');

var server = new Suit();
server.httpPort = 8888;

function noProxyForRequest(request,response)
{
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        (request.connection.socket ? request.connection.socket.remoteAddress : null);

    console.log("request from",ip,"is not mapped:", request.headers.host, request.url);
}

server.setNoHostHandler(noProxyForRequest);
server.start();