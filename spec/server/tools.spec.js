
const tools = require('../../lib/tools')

describe( "testing tools", () => {

    it("can get an IP address off a request", () => {
        const IP = '1.1.1.1'
        const request = { socket: {}, headers:{}, connection:{ socket: {remoteAddress: IP} } }
        expect(tools.getIp(request)).toBe(IP);
    });

    it("can handle null IP in headers", () => {
        const request = { socket: {}, headers:{}, connection:{ } }
        expect(tools.getIp(request)).toBe(null);
    });

});