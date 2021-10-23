const interpolate = require('../../lib/interpolater');

describe( "The interpolater", () => {

    it("can parse an arrays and complexe objects", () => {
        var car = { body: { seats: ["drivers"]}};
        let template = "hello ${a[0][0].b.c}";
        let data = {a: [[{b: {c: "world",f: "hello"}}, 2], 3],d: 12,e: 14};

        expect(interpolate("${a[0][0].b.f} ${a[0][0].b.c}", data)).toBe("hello world");
        expect(interpolate("${car.body.seats}", {car})).toBe("drivers");
        expect(interpolate("${body.seats}", car )).toBe("drivers");
    });

    it("can parse simple Array", () => {
        var vids = ["A","B"];
        var user = {
            name: "Test",
            videos: vids
        };
        expect(interpolate("${user.videos}",{user})).toEqual('A,B');
        expect(interpolate("${videos}",user )).toEqual('A,B');
    });

    it("can parse simple object", () => {
        var vids = "vids";
        var user = {
            name: "Test",
            videos: vids
        };
        expect(interpolate("${user.videos}", {user} )).toEqual(vids);
    });

});
