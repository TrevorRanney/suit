
var http = require('http');

var handlers = {};
class Server{

    constructor(){
        this.httpPort = 80;
    }

    addHost(name, handler){
        handlers[name] = handler;
    }

    handleRequest(request, response){
        var host = request.headers.host;
        var handler = handlers[host];
        if(handler)handler(request, response);
    }

    start(){
        var server = http.createServer(this.handleRequest);
        server.listen(this.httpPort, '0.0.0.0');
    }

}

module.exports = Server