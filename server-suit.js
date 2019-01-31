"use strict"

var http = require('http');

class Server{

    constructor(){
        this.handlers = {};
        this.httpPort = 80;
    }

    addHost(name, handler){
        this.handlers[name] = handler;
    }

    handleRequest(request, response){
        var host = request.headers.host;
        var handler = this.handlers[host];
        if(handler)handler(request, response);
    }

    start(){
        var server = http.createServer(this.handleRequest);
        server.listen(this.httpPort, '0.0.0.0');
    }

}

module.exports = Server