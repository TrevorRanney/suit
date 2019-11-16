
    var http = require('http');
var Router = require('./lib/router')

var handlers = {};
var middleware = [];
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

    //test
    addMiddleware(newMiddleware)
    {
        middleware.push(newMiddleware);
    }

    handleRequest(request, response){
        //test
        middleware.forEach( (middle) =>
        {
            middle(request,response);
        });
        var host = request.headers.host;
        var handler = handlers[host];
        if(logger)logger.logRequest(request);
        if(handler)
        {
            if(handler.respond)handler.respond(request, response);
            else handler(request,response);
        }
        else {
            if(noHostHandler)noHostHandler(request, response);
        }
    }

    start(){
        var server = http.createServer(this.handleRequest);
        server.listen(this.httpPort, '0.0.0.0');

        //could for each through a range of ports or accociate port with server
       // var server2 = http.createServer(this.handleRequest);
       // server2.listen(443, '0.0.0.0');
    }

    router(){
        return Router;
    }

}

module.exports = Server