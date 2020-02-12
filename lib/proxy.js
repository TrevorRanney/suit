'use strict'

var https = require('https');
var http = require('http');
var tools = require('./tools');

class Proxy
{
    constructor(host, port)
    {
        this._host = host;
        this._port = port;
        console.log("Created proxy to redirect to", this._host, this._port);
    }

    getHost()
    {
        return this._host;
    }

    respond(request, response, goToHost)
    {
        var host = this._host;
        if(goToHost)host = goToHost;
        console.log(tools.getIp(request), request.headers.host, request.url, "-->", this._host, this._port );
        var options = 
        {
            host: this._host,
            port: this._port,
            path: request.url,
            method: request.method,
            headers: request.headers,
            connection: request.connection,
            pragma: request.pragma,
            cache: request.cache,
            agent: request.agent,
            accept: request.accept,
            referer: request.referer,
            encoding: request.encoding,
            language: request.language
        };
        console.log("HOST!!!!",options.headers.host )
      //  options.headers.host = host ;//+ ":" + this.port;
        
        var connector = https.request( options, function(res)
        {
            res.pipe(response,
            {
                end: true
            }); //tell 'response' end=true
        });
        request.pipe(connector,
        {
            end: true
        });
        connector.on("error", function(error){
            response.end(error.toString());
        });
    };
}

module.exports = Proxy;