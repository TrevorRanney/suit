'use strict'

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

    respond(request, response)
    {
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

        var newReq = http.request(options, function (newRes) 
        /* c8 ignore next 4 */
        {
            var headers = newRes.headers;
            response.writeHead(newRes.statusCode, headers);
            newRes.pipe(response);
        }).on('error', function (err) {
            /* c8 ignore next 2 */
            response.statusCode = 500;
            response.end();
        });

        request.pipe(newReq);
    };
}

module.exports = Proxy;
