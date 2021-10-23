const forloop = require('../../lib/forlooper');

describe( "The forlooper", () => {

    it("can loop", () => {
        var variable = { user: {videos: [{mp4:"data"},{mp4: "v2"}]} };

        expect(forloop('$for(video : user.videos){${video.mp4}}', variable))
        .toBe("datav2");
    });


});
