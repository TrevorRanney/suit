
var fs = require('fs');
var path = require('path');
const { Transform } = require('stream');

var _baseRoute = './';
var _routes = {};
var folders = [];
var _name;
var _body;


var getMemeType = (file) => {
    var fileType = file.split('.').pop();
    var mime = {
        html: 'text/html',//should be handled above
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        js: 'application/javascript',
        mp4: 'video/mp4'
    };
    var type = mime[fileType] || 'text/plain';
    // console.log("file",file,"filetype", fileType, "type",type);
    return type;
}

var getPage = (pageName) =>
{
    var pagePath = path.join(_baseRoute, pageName);
    console.log(pagePath);
    var html = fs.readFileSync(pagePath);
    var stringHtml = html.toString();
    return getSubPages(stringHtml);
}

//variables look like ${}
// const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
const interpolate = require('./interpolater');
//links to subpages look like ^{}
const getSubPages = (html) => html.replace(/\^{([^}]+)}/g,(_, pageName) => getPage(pageName));
//should something be rendered ${{}}
const resolveLoops = require('./forlooper');

class Router
{
    constructor(name){
        _name = name;
    }

    addRoute(url, resource, variables)
    {
        url = url.toLocaleLowerCase()
        if (resource){
            if(typeof resource === "string")_routes[url] = this.fileRouter(resource, variables); //routing back a file
            else _routes[url] = resource; //routing to function
        }
        else _routes[url] = this.fileRouter(url);
        // console.log("router", _name, "route added:", url, ":", _routes[url]);
    };

    addFolder(folder)
    {
        folders.push(folder);
    }

    setBody(file)
    {
        if(!file)_body = null;
        else
        {
            _body = getPage(file);
        }
    };

    fileRouter(file, variables)
    {
        var extention = file.split('.').pop();
        var filePath = path.join( _baseRoute, file); 
        if(extention == 'html')
        {
            return function routesToRenderedHtml(request, response){
                var fileReader = fs.createReadStream(filePath);
                response.writeHead(200, {'Content-Type': 'text/html' });
                fileReader.on('error', (e) =>
                {
                    console.log("An error was handled in file router;", e)
                })
                .pipe(new Transform({
                        transform(chunk, encoding, callback) {
                            var htmlWithSubPages = getSubPages(chunk.toString());
                            var htmlWithSubPagesAndLoops = resolveLoops(htmlWithSubPages, variables);
                            var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables);

                            if(_body){
                                htmlWithVariables = interpolate(_body, {body: htmlWithVariables})
                            }
                            this.push(htmlWithVariables);
                            callback();
                    
                        }
                    })
                ).pipe(response);
            }   
        }

        return function routesToFile(request, response){
            // console.log("FILE PATH",filePath, request.headers) 
            var agent = request.headers["user-agent"] || request.headers["user-agent"];
            // console.log(agent)
            // Object.keys(request.headers).forEach(header => { console.log(header); if(header=='user-agent')console.log("!!!")})

            if(agent && agent.indexOf('Mac') != -1 && extention == 'mp4'){
                // console.log("FILE PATH@",filePath, request.headers) 
                var file = fs.readFileSync(filePath);
                //fs.readFile(filePath, (file) =>{
                    var range = request.headers.range;
                    var total = file.length;
                    var parts = range.replace(/bytes=/, "").split("-");
                    var partialstart = parts[0];
                    var partialend = parts[1];
        
                    var start = parseInt(partialstart, 10);
                    var end = partialend ? parseInt(partialend, 10) : total;
                    var chunksize = (end-start);
                    response.writeHead(206, {
                        "Content-Range": "bytes " + start + "-" + end + "/" + total,
                        "Accept-Ranges": "bytes",
                        "Content-Length": chunksize,
                        "Content-Type": "video/mp4"
                    });
                    response.end(file.slice(start, end)); 
                //});
            }
            else{
                // var filePath = path.join( _baseRoute, file); 
                var fileReader = fs.createReadStream(filePath);
                var memeType = getMemeType(filePath);
                response.writeHead(200, {'Content-Type': memeType });
                fileReader.on('error', (e) =>
                {
                    console.log("An error was handled in router;", e)
                }).pipe(response);
            }
        }
    }

    setBaseRoute(route)
    {
        _baseRoute = route;
        console.log("router", _name, "base route set to:", _baseRoute);
    };

    serve(request, response)
    {
        var url = request.url.toLocaleLowerCase();
        // console.log(url);
        var baseUrl = url.split('?')[0];
        var parts = baseUrl.split('/');
        parts.forEach(folder => {
            if(folders.includes(folder)){
                var folderRouter = this.fileRouter(baseUrl.substr(baseUrl.indexOf('/')) );
                folderRouter(request,response);
                return;
            }
        });
        var routeResolution = _routes[baseUrl];
        if (routeResolution)
        {
            routeResolution(request, response);
        }
        else
        {
            console.log(_name, "contains no route to ", request.url, "in router", _name);
            console.log("possible routes are", _routes);
            response.writeHead(404, {'Content-Type': 'text/html'}); 
            response.end(`<!DOCTYPE html>
            <html>
            <head>
            <style>
            body {background-color: #000; color: blanchedalmond;}
            </style>
            </head>
            <body>
            Not found :(
            </body>
            </html>`);
        }
    };
};

module.exports = Router;