
var http = require('http');

var Logger = require('./lib/logger');

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
        var handler = handlers[host];
        if(logger)logger.logRequest(request);
        if(handler)handler(request, response);
        if(noHostHandler)noHostHandler(request, response);
    }

    start(){
        var server = http.createServer(this.handleRequest);
        server.listen(this.httpPort, '0.0.0.0');
    }

}

module.exports = Server