const HttpProxy = require('../../lib/http-proxy');
// const superTest = require('supertest')

describe( "The proxy", () => {

    beforeEach( () => {
        this.proxy = new HttpProxy('localhost',6014);
    });

    it("can get the host", () => {
        const host = this.proxy.getHost()
        expect(host).toEqual('localhost');
    });

    it("can get the host", () => {
        const host = this.proxy.getHost()
        expect(host).toEqual('localhost');
    });

});
