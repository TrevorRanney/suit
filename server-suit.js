
var http = require('http');
var Router = require('./lib/router')

var handlers = {};
var logger;
var noHostHandler;

class Server{
    
    constructor(){
        this.httpPort = 80;
    }

    setLogger(loggingModule){
        logger = loggingModule;
    }

    setNoHostHandler(noHostHandlerModule){
        noHostHandler = noHostHandlerModule;
    }

    addHost(name, handler){
        handlers[name] = handler;
    }

    handleRequest(request, response){
        var host = request.headers.host;
        // console.log("!!!!!!!!!!!!host", host);
        var handler = handlers[host];
        // console.log(logger);
        if(logger)logger.logRequest(request);
        if(handler)handler(request, response);
        else {
            if(noHostHandler)noHostHandler(request, response);
        }
    }

    start(){
        var server = http.createServer(this.handleRequest);
        server.listen(this.httpPort, '0.0.0.0');
    }

    router(){
        return Router;
    }

}

module.exports = Server