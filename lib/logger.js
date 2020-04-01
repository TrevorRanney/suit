
var fs = require('fs');

var Formatter = require('./formatter');
var TimeStamper = require('./time-stamper');

formatter = new Formatter();
timeStamper = new TimeStamper();

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
        var requestData = this.getRequestData(request);
        if(this.verbose)console.log(requestData);
        fs.appendFile(this.saveFileLocation, `{${requestData}}: ${requestString}  \n\n`, function(err)
        {
            if (err) console.log("Could not save request");
        });
    };

    getRequestData(request)
    {
        var host = request.headers ? request.headers.host : "No-host";
        var requestData = "" + request.method + " " + host + request.url;

        var ip = this.getIp(request);
        requestData += "  from: " + ip + " @: " + timeStamper.getTimeStamp();

        return requestData;
    }

    getIp(request)
    {
        return request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            (request.connection.socket ? request.connection.socket.remoteAddress : null);
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
