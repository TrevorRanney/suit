const forloop = require('../../lib/forlooper');

describe( "The forlooper", () => {

    it("can do a simple loop", () => {
        var videos = ["data","v2"];

        expect(forloop('$for(video : videos){${video}}', videos))
        .toBe("datav2");
    });

    it("can do a simple loop and replace multiple things", () => {
        var videos = ["data","v2"];

        expect(forloop('$for(video : videos){${video}${video}}', videos))
        .toBe("datadatav2v2");
    });

    it("can do a simple loop with html", () => {
        var videos = ["data","v2"];

        expect(forloop('$for(video : videos){<div>${video}</div>}', videos))
        .toBe("<div>data</div><div>v2</div>");
    });

    it("can add an index", () => {
        var list = [7,7];
        expect(forloop('$for(l : list){${index},}', list))
        .toBe("0,1,");
    });

    it("can add multiple indexes", () => {
        var list = [7,7];
        expect(forloop('$for(l : list){${index}${index},}', list))
        .toBe("00,11,");
    });

    it("can get array from object data", () => {
        var variable = {videos: ["data","v2"]};

        expect(forloop('$for(video : videos){${video}}', variable))
        .toBe("datav2");
    });

    it("can loop through objects", () => {
        var variable = {videos: [{mp4:"data"},{mp4: "v2"}]};

        expect(forloop('$for(video : videos){${video.mp4}}', variable))
        .toBe("datav2");
    });

    it("can loop through complex objects", () => {
        var variable = { user: {videos: [{mp4:"data"},{mp4: "v2"}]} };

        expect(forloop('$for(video : user.videos){${video.mp4}}', variable))
        .toBe("datav2");
    });

});
