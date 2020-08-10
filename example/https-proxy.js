var fs = require('fs');
var tls = require('tls');
var https = require('https');

var Suit = require('../server-suit');
var HttpProxy = require('../lib/http-proxy');

//http
var site1 = new HttpProxy('localhost', 3331);
var site2 = new HttpProxy('localhost', 3332);

var redirectToHttps = (request,response) => {
    response.writeHead(302, {'Location': 'https://' + request.headers.host + request.url });
    response.end();
};

var httpServer = new Suit();
httpServer.addHost('example.com', redirectToHttps);
httpServer.addHost('example2.com', redirectToHttps);

function noHost(request,response){
    response.end("Sorry No route to this site found");
}

httpServer.setNoHostHandler(noHost);
httpServer.start();


var httpsServer = new Suit();
httpsServer.addHost('example.com', brawler); 
httpsServer.addHost('example2.com', content); 

var secureContext = {
    'example1.com': tls.createSecureContext({
        key: fs.readFileSync("PATHTO/privkey.pem"),
        cert: fs.readFileSync("PATHTO/cert.pem"),
        ca: fs.readFileSync("PATHTO/chain.pem")
    }),
    'example2.com': tls.createSecureContext({
        key: fs.readFileSync("PATHTO/privkey.pem"),
        cert: fs.readFileSync("PATHTO/cert.pem"),
        ca: fs.readFileSync("PATHTO/chain.pem")
    }),
}
var options = {
    SNICallback: function (domain, cb) {
        if (secureContext[domain]) {
            if (cb) {
                cb(null, secureContext[domain]);
            } else {
                // compatibility for older versions of node
                return secureContext[domain]; 
            }
        } else {
            console.log("could not return cert to", domain);
        }
    },
    key: fs.readFileSync("PATHTO/privkey.pem"),
    cert: fs.readFileSync("PATHTO/cert.pem"),
    ca: fs.readFileSync("PATHTO/chain.pem")
}
https.createServer(options, httpsServer.handleRequest.bind(httpsServer)).listen(443);
