
var http = require('http');
var Router = require('./lib/router')
var HttpProxy = require('./lib/http-proxy')

class Server{
    
    constructor(port){
        this.noHostHandler;
        this.httpPort = port || 80;
        this.handlers = {};
        this.logger = null;
        this.wellKnownHandler;
    }

    setLogger(loggingModule){
        this.logger = loggingModule;
    }

    setNoHostHandler(noHostHandlerModule){
        this.noHostHandler = noHostHandlerModule;
    }

    addHost(name, handler){
        this.handlers[name] = handler;
    }

    addCertifcateRenewalServer(ip, port){
        this.wellKnownHandler = new HttpProxy(ip, port)
    }

    handleRequest(request, response){
        var host = request.headers.host;
        var handler = this.handlers[host];
        if(this.logger)this.logger(request);
        if(request.url && request.url.toLocaleLowerCase().includes('.well-known') && this.wellKnownHandler)
        {
            this.wellKnownHandler.respond(request, response)
        }
        else if(handler)
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
    }

    newRouter(name){
        return new Router(name);
    }

}

module.exports = Server