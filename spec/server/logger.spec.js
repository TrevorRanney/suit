
const fs = require('fs');

var Logger = require('../../lib/logger');

describe( "The logger", () => {

    beforeEach( () => {
        this.logger = new Logger("test.txt");
    });
    
    it("can log to a file", () => {
        var logWritten = false;
        spyOn(fs,'appendFile').and.callFake( (file, text, callback) => { 
            logWritten = true; 
            callback("The line in code with append file will not be covered but everything else will. ;)")
        });
        this.logger.logRequest("hi");
        expect(logWritten).toBe(true);
    });

});
