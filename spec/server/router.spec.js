
var Suit = require('../../server-suit');

describe( "The router", () => {

    beforeEach( () => {
        this.server = new Suit();
        this.router = this.server.newRouter("routerTest");
    });

    it("serves a response when it has a valid route and route resolution", () => {
        var routeWasUsed = false;
        var responseRan = false;
        var mockRoute = (request, response) => { routeWasUsed = true, response() };
        var request = {};
        request.url = "testUrl";
        var responseCallback = ()=> {responseRan = true};
        this.router.addRoute(request.url, mockRoute);
        
        this.router.serve(request, responseCallback);

        expect(routeWasUsed).toBe(true);
        expect(responseRan).toBe(true);
    });

    it("serve: ends the response and return a 404 on an invalid route", () => {
        var result = "";
        var resultStatus = "";
        var resultHeaders = "";
        var response = {};
        response.writeHead = (status, headers) => { resultStatus = status, resultHeaders = headers}; 
        response.end = (status) => { result = status}; 
        var request = {};
        request.url = "invalidURL"
        
        this.router.serve(request, response);
        
        // expect(result).toBe("404");
        expect(resultStatus).toBe(404);
    });

    it("serves a html file", () => {
        var result = "";
        var resultStatus = "";
        var resultHeaders = "";
        var response = {};
        response.writeHead = (status, headers) => { resultStatus = status, resultHeaders = headers}; 
        response.end = (status) => { result = status}; 
        response.on = () => {};
        response.once = () => {};
        response.write = () => {};
        response.emit = () => {};

        var request = {};
        request.url = "testUrl"

        var complexVariable = {
            stuff: ['world','hello'],
            things: { stuff: ['XD']}
        };
        this.router.setBaseRoute('spec/server/test-files/');
        this.router.addRoute(request.url, "test.html", complexVariable);
        this.router.setBody("test-body.html");

        this.router.serve(request, response);

        expect(resultStatus).toBe(200);
    });

    it("serves a function", () => {
        var testCalled = false;
        var request = {};
        var response = {};
        request.url = "testUrl"
        var testFunction = (request, response) => { testCalled = true };
        this.router.addRoute(request.url, testFunction);

        this.router.serve(request, response);

        expect(testCalled).toBe(true);
    });

    it("serves a file", () => {
        var testCalled = false;
        var request = {};
        request.url = 'test.css';
        // var testFunction = (request, response) => { testCalled = true };
        this.router.setBaseRoute('spec/server/test-files/');
        this.router.addRoute(request.url);

        var response = {};
        response.writeHead = (status, headers) => { resultStatus = status, resultHeaders = headers}; 
        response.end = (status) => { result = status}; 
        response.on = () => {};
        response.once = () => {};
        response.write = () => {};
        response.emit = () => {};

        this.router.serve(request, response);

        expect(resultStatus).toBe(200);
        expect(resultHeaders).toEqual({ 'Content-Type': 'text/css' });
    });


});