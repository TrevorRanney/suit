
var http = require('http');
var Router = require('./lib/router')

// var 
// var middleware = [];
// var logger;
// var noHostHandler;

class Server{
    
    constructor(){
        this.noHostHandler;
        this.httpPort = 80;
        // this.httpsPort = 443;
        this.handlers = {};
    }

    // setLogger(loggingModule){
    //     logger = loggingModule;
    // }

    setNoHostHandler(noHostHandlerModule){
        this.noHostHandler = noHostHandlerModule;
    }

    addHost(name, handler){
        this.handlers[name] = handler;
    }

    //test
    // addMiddleware(newMiddleware)
    // {
    //     middleware.push(newMiddleware);
    // }

    handleRequest(request, response){
        // console.log("handle request",this)
        //test
        // middleware.forEach( (middle) =>
        // {
        //     middle(request,response);
        // });
        var host = request.headers.host;
        var handler = this.handlers[host];
        // if(logger)logger.logRequest(request);
        if(handler)
        {
            if(handler.respond)handler.respond(request, response);
            else handler(request,response);
        }
        else 
        {
            if(this.noHostHandler)
            {
                if(this.noHostHandler.respond)this.noHostHandler.respond(request, response);
                else this.noHostHandler(request,response);
            }
            else{
                console.log("no server to response to", host)
                console.log("possible options:",  this.handlers)
            }
        }
    }

    start(){
        var server = http.createServer(this.handleRequest.bind(this));
        server.listen(this.httpPort, '0.0.0.0');
        // console.log("server",this);
        //could for each through a range of ports or accociate port with server
    //    var httpsServer = https.createServer(this.handleRequest);
    //    httpsServer.listen(this.httpsPort, '0.0.0.0');
    }

    newRouter(name){
        return new Router(name);
    }

}

module.exports = Server