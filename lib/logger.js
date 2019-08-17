
var fs = require('fs');

var Formatter = require('./formatter');
formatter = new Formatter();

class Logger
{
    constructor(saveFileLocation)
    {
        this.verbose = false;
        this.saveFileLocation = saveFileLocation;
        
        this.logText = (text) =>
        {
            fs.appendFile(this.saveFileLocation, requestString + "\n\n", function(err)
            {
                if (err) console.log("Could not save request");
            });
        };
    }

    verboseOn()
    {
        this.verbose = true;
    }

    verboseOff()
    {
        this.verbose = false;
    }

    logRequest(request)
    {
        var requestString = formatter.stringifyRequest(request);
        if(this.verbose)console.log(requestString);
        fs.appendFile(this.saveFileLocation, requestString + "\n\n", function(err)
        {
            if (err) console.log("Could not save request");
        });
    };

    log(...args) 
    {
        if(this.verbose)console.log(...args);
        this.logText([args]);
    }

    alert(...args) 
    {
        console.log(...args);
        this.logText([args]);
    }
}
module.exports = Logger;
