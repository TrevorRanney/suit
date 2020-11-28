
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
        console.log("router", _name, "route added:", url, ":", _routes[url]);
    };

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
        if(file.split('.').pop() == 'html')
        {
            return function routesToRenderedHtml(request, response){
                var filePath = path.join( _baseRoute, file); 
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
            var filePath = path.join( _baseRoute, file); 
            var fileReader = fs.createReadStream(filePath);
            var memeType = getMemeType(filePath);
            response.writeHead(200, {'Content-Type': memeType });
            fileReader.on('error', (e) =>
            {
                console.log("An error was handled in router;", e)
            }).pipe(response);
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
        var routeResolution = _routes[url];
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