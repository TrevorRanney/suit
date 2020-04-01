
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
        request.url = "testUrl"
        var responseCallback = ()=> {responseRan = true};
        this.router.addRoute("testUrl", mockRoute);
        this.router.serve(request, responseCallback);
        expect(routeWasUsed).toBe(true);
        expect(responseRan).toBe(true);
    });

    it("serve: ends the response and return a 404 on an invalid route", () => {
        var result = "";
        var response = {};
        response.end = (status) => { result = status}; 
        var request = {};
        request.url = "invalidURL"
        this.router.serve(request, response);
        expect(result).toBe("404");
    });

});