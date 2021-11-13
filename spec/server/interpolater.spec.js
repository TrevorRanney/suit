const interpolate = require('../../lib/interpolater');

describe( "The interpolater", () => {

    it("can parse an arrays and complexe objects", () => {
        var car = { body: { seats: ["drivers","pilots"]}};
        let template = "hello ${a[0][0].b.c}";
        let data = {a: [[{b: {c: "world",f: "hello"}}, 2], 3],d: 12,e: 14};

        expect(interpolate("${a[0][0].b.f} ${a[0][0].b.c}", data)).toBe("hello world");
        expect(interpolate("${car.body.seats}", {car})).toBe("drivers,pilots");
        expect(interpolate("${car.body.seats[0]}", {car})).toBe("drivers");
        expect(interpolate("${body.seats}", car )).toBe("drivers,pilots");
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

    it("can parse a simple object", () => {
        var vids = "vids";
        var user = {
            name: "Test",
            videos: vids
        };
        expect(interpolate("${user.videos}", {user} )).toEqual(vids);
    });

    it("can parse ", () => {
        var vids = "vids";
        var user = {
            name: "Test",
            videos: vids
        };
        expect(interpolate("${videos}", user )).toEqual(vids);
    });

    it("can very parse string", () => {
        var user = "frank";
        expect(interpolate("${user}", user )).toEqual(user);
    });

    it("can very parse string twice", () => {
        var user = "frank";
        expect(interpolate("${user} - ${user}", {user} )).toEqual("frank - frank");
    });

    it("can parse arrays", () => {
        var variable = { letters: ['a','b']};
        expect(interpolate('${letters}',variable))
        .toBe('a,b');
        expect(interpolate('${letters[1]}',variable))
        .toBe('b');
    });

    it("can parse an array of objects", () => {
        var objectList = [{mp4:"data", stuff:"things"},{mp4: "v2",stuff:"things"}];
        var variable = { user: {videos: objectList} };
        console.log(`${variable.user.videos}`)
        console.log(`${variable.user.videos[1]}`)
        console.log(`${variable.user.videos[1].mp4}`)
        console.log("---")
        console.log(interpolate('${user.videos}', variable))
        console.log(interpolate('${user.videos}', variable)[1])
        console.log(interpolate('${user.videos}', variable)[1].mp4)
        expect(interpolate('${user.videos[1].mp4}', variable))
        .toBe("v2");
    });

});
