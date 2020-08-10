
var Suit = require('../../server-suit');

var http = require('http');
var net = require('net');

var Logger = require('../../lib/logger');
var logger = new Logger();

describe( "The server", () => {

    beforeEach( () => {
        spyOn(Logger.prototype,'logRequest');
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

    it("does not crash and does not respond when request is for a host we do not know about", () => {
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = 'unknownhost';

        this.server.handleRequest(requestA, {});
        expect( this.server.handleRequest.bind(this.server,requestA, {}) ).not.toThrow();
    });

    it("server can response to unknownhost hosts", () =>{
       this.server.setNoHostHandler(this.serverBHandler);
       
       var undefinedHostRequest = {};
       undefinedHostRequest.headers = {};
       undefinedHostRequest.headers.host = 'unknownhost';
       this.server.handleRequest(undefinedHostRequest,{});

       expect(this.serverBwasHit).toBe(true);
    });

    it("responds to serverA request with serverA Responder", () => { 
        var hostA = 'hostA';
        var serverWithResponder = {
            respond : this.serverAHandler
        };
        this.server.addHost(hostA,serverWithResponder);
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = hostA;

        this.server.handleRequest(requestA, {});

        expect(this.serverAwasHit).toBe(true);
    });

    it("server can response to unknownhost hosts With a Responder", () =>{
        var serverWithResponder = {
            respond : this.serverBHandler
        };
        this.server.setNoHostHandler(serverWithResponder);
        
        var undefinedHostRequest = {};
        undefinedHostRequest.headers = {};
        undefinedHostRequest.headers.host = 'unknownhost';
        this.server.handleRequest(undefinedHostRequest,{});
 
        expect(this.serverBwasHit).toBe(true);
     });

     it("can log requests", () => { 
        var hostA = 'hostA';
        this.server.addHost(hostA,this.serverAHandler);
        var requestA = {};
        requestA.headers = {};
        requestA.headers.host = hostA;

        var logHit = false;
        this.server.setLogger(() => {logHit = true});

        this.server.handleRequest(requestA, {});

        expect(this.serverAwasHit).toBe(true);
        expect(logHit).toBe(true);
    });

    it("starts an http server", () => {
        this.server.httpPort = 99;
        spyOn(http, 'createServer').and.callThrough();
        this.server.start();
        expect(http.createServer).toHaveBeenCalled();
    });

});