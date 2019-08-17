var Formatter = require('../../lib/formatter');

describe( "The formatter", () => {

    beforeEach( () => {
        this.formatter = new Formatter();

    });

    it("can parse a circular reference", () => {
        var obj = {
            a: "foo"
        };
        obj.b = obj;

        var stringObj = this.formatter.stringifyRequest(obj);

        expect(stringObj).toEqual('{"a":"foo"}');
    });

});
