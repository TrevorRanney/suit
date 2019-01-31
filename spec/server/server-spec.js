
var Suit = require('../../server-suit');
var http = require('http');
var net = require('net');
var Server = net.Server;

describe( "The server", () => {

    beforeEach( () => {
        this.server = new Suit();
        this.serverAwasHit = false;
        this.serverBwasHit = false;
        this.serverAHandler = () => {
            this.serverAwasHit = true;
        };
        this.serverBHandler = () => {
            this.serverBwasHit = true;
        };
    });

    it("responds to serverA request with serverA", () => {
        var hostA = 'hostA';
        this.server.addHost(hostA,this.serverAHandler);
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = hostA;

        this.server.handleRequest(requestA, {});

        expect(this.serverAwasHit).toBe(true);
    });

    it("separates requests for multiple servers", () => {
        var hostA = 'hostA';
        var hostB = 'hostB';
        this.server.addHost(hostA,this.serverAHandler);
        this.server.addHost(hostB,this.serverBHandler);
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = hostA;
        var requestB = {};
        requestB.headers = {};
        requestB.headers.host = hostB;

        this.server.handleRequest(requestA, {});
        
        expect(this.serverAwasHit).toBe(true);
        expect(this.serverBwasHit).toBe(false);
        this.server.handleRequest(requestB, {});
        expect(this.serverBwasHit).toBe(true);
    });

    it("does not crash and does not response when request for host we do not know about", () => {
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = 'unknownhost';

        this.server.handleRequest(requestA, {});
        expect( this.server.handleRequest.bind(this.server,requestA, {}) ).not.toThrow();
    });

    it("starts an http server", () => {
        spyOn(http, 'createServer').and.callThrough();
        this.server.start();
        expect(http.createServer).toHaveBeenCalled();
    });

});