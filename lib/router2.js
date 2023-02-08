
var fs = require('fs');
var path = require('path');
const { Transform } = require('stream');

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
        js:  'application/javascript',
        mp4: 'video/mp4'
    };
    var type = mime[fileType] || 'text/plain';
    // console.log("file",file,"filetype", fileType, "type",type);
    return type;
}


//variables look like ${}
// const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
const interpolate = require('./interpolater');

//should something be rendered ${{}}
const resolveLoops = require('./forlooper');

router = (name) =>
{
    const _name = name;
    const folders = [];
    var _routes = {};
    var _bodyUrl;
    var _baseRoute = './';
    var _noRouteHandler;

    const getSubPages = (html) => html.replace(/\^{([^}]+)}/g,(_, pageName) => getPage(pageName))

    const getPage = (pageName) =>
    {
        var pagePath = path.join(_baseRoute, pageName);
        var html = fs.readFileSync(pagePath);
        var stringHtml = html.toString();
        return getSubPages(stringHtml);
    }

    const fileRouter = (file, variables) =>
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
                            var htmlWithSubPages = getSubPages(chunk.toString())
                            var htmlWithSubPagesAndLoops = resolveLoops(htmlWithSubPages, variables || {} )
                            var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables || {} )
                            if(_bodyUrl){
                                var _body = getPage(_bodyUrl)
                                htmlWithVariables = interpolate(_body, {body: htmlWithVariables})
                            }
                            this.push(htmlWithVariables)
                            callback()
                    
                        }
                    })
                ).pipe(response)
            }   
        }

    }

    return {
        addRoute : (url, resource, variables) =>
        {
            // console.log("route 2 added route", url)
            url = url.toLocaleLowerCase()
            if (resource){
                if(typeof resource === "string")_routes[url] = fileRouter(resource, variables); //routing back a file
                else _routes[url] = resource; //routing to function
            }
            else _routes[url] = fileRouter(url);
            console.log("router", _name, "route added:", url, ":", _routes[url]);
            // console.log("ROUTES", _routes)
        },
        addFolder : (folder) =>
        {
            folders.push(folder);
        },
        setBody : (file) =>
        {
            _bodyUrl = file
        },
        setNoRouteHandler : (funcHandler) =>
        {
            _noRouteHandler = funcHandler
        },
        //links to subpages look like ^{}
        //getSubPages : (html) => html.replace(/\^{([^}]+)}/g,(_, pageName) => getPage(pageName)),
        setBaseRoute : (route) =>
        {
            _baseRoute = route
            console.log("router", _name, "base route set to:", _baseRoute)
        },
        serve : (request, response) =>
        {
            var url = request.url.toLocaleLowerCase();
            var baseUrl = url.split('?')[0];
            console.log("SERVING2 ", _name, baseUrl, _bodyUrl)
            var parts = baseUrl.split('/');
            parts.forEach(folder => {
                if(folders.includes(folder)){
                    var folderRouter = fileRouter(baseUrl.substr(baseUrl.indexOf('/')) )
                    folderRouter(request,response)
                    return;
                }
            });
            var routeResolution = _routes[baseUrl];
            if (routeResolution)
            {
                console.log("ROUTE RES", routeResolution)
                routeResolution(request, response);
            }
            else if(_noRouteHandler){
                _noRouteHandler(request, response);
            }
            else
            {
                console.log(_name, "contains no route to ", request.url, "in router", _name);
                console.log("possible routes are", _routes, folders);
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
        }
    }
};

module.exports = router;