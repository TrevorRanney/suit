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

    respond(request, response, goToHost) 
    {
        var host = this._host;
        if (goToHost) host = goToHost;
        console.log(tools.getIp(request), request.headers.host, request.url, "-->", this._host, this._port);
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
        console.log("HOST!!!!", options.headers.host);
        //  options.headers.host = host ;//+ ":" + this.port;


        var newReq = http.request(options, function (newRes) 
        {
            var headers = newRes.headers;

            // modify `headers` here ...

            response.writeHead(newRes.statusCode, headers);
            newRes.pipe(response);
        }).on('error', function (err) {
            response.statusCode = 500;
            response.end();
        });

        request.pipe(newReq);
    };
}

module.exports = Proxy;





//  Install npm dependencies first
//  npm init
//  npm install --save url@0.10.3
//  npm install --save http-proxy@1.11.1

// var httpProxy = require("http-proxy");
// var http = require("http");
// var url = require("url");
// var net = require('net');

// var server = http.createServer(function (req, res) {
//   var urlObj = url.parse(req.url);
//   var target = urlObj.protocol + "//" + urlObj.host;

//   console.log("Proxy HTTP request for:", target);

//   var proxy = httpProxy.createProxyServer({});
//   proxy.on("error", function (err, req, res) {
//     console.log("proxy error", err);
//     res.end();
//   });

//   proxy.web(req, res, {target: target});
// }).listen(8080);  //this is the port your clients will connect to

// var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

// var getHostPortFromString = function (hostString, defaultPort) {
//   var host = hostString;
//   var port = defaultPort;

//   var result = regex_hostport.exec(hostString);
//   if (result != null) {
//     host = result[1];
//     if (result[2] != null) {
//       port = result[3];
//     }
//   }

//   return ( [host, port] );
// };

// server.addListener('connect', function (req, socket, bodyhead) {
//   var hostPort = getHostPortFromString(req.url, 443);
//   var hostDomain = hostPort[0];
//   var port = parseInt(hostPort[1]);
//   console.log("Proxying HTTPS request for:", hostDomain, port);

//   var proxySocket = new net.Socket();
//   proxySocket.connect(port, hostDomain, function () {
//       proxySocket.write(bodyhead);
//       socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
//     }
//   );

//   proxySocket.on('data', function (chunk) {
//     socket.write(chunk);
//   });

//   proxySocket.on('end', function () {
//     socket.end();
//   });

//   proxySocket.on('error', function () {
//     socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
//     socket.end();
//   });

//   socket.on('data', function (chunk) {
//     proxySocket.write(chunk);
//   });

//   socket.on('end', function () {
//     proxySocket.end();
//   });

//   socket.on('error', function () {
//     proxySocket.end();
//   });

// });