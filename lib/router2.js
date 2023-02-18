
var fs = require('fs');
var path = require('path');

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


//variables look like ${}
// const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
const interpolate = require('./interpolater');

//should something be rendered ${{}}
const resolveLoops = require('./forlooper');

const isRegex = (value) => {
    try {
        new RegExp(value);
        return true;
    } catch (e) {
        return false;
    }
}


router = (name) => {
    const _name = name
    const folders = []
    var _routes = {}
    var _regexRoutes = {}
    var _bodyUrl
    var _baseRoute = './'
    var _noRouteHandler

    const getSubPages = (html) => {
        return html.replace(/\^{([^}]+)}/g, (_, pageName) => getPage(pageName))
    }

    const getPage = (pageName) => {
        var pagePath = path.join(_baseRoute, pageName)
        var html = fs.readFileSync(pagePath)
        var stringHtml = html.toString()
        return getSubPages(stringHtml)
    }

    const matchesRegex = (route) => {
        console.log("REGEX ROUTES:", _regexRoutes)
        // return _regexRoutes.find(regex => regex.test(route))
        const regexes = Object.keys(_regexRoutes);
        for (const regexString of regexes) {
            // console.log(`${regex}: ${_regexRoutes[regex]}`);
            const pattern = regexString.slice(1, regexString.lastIndexOf('/'));
            const flags = regexString.slice(regexString.lastIndexOf('/') + 1);
            const regex = new RegExp(pattern, flags);
            if (new RegExp(regex).test(route)) return _regexRoutes[regexString]
        }
        console.log("no regex match")
        return false
    }

    const fileRouter = (file, variables) => {
        var extention = file.split('.').pop()
        var filePath = path.join(_baseRoute, file)
        if (extention == 'html') {
            return function routesToRenderedHtml(request, response) {
                var html = fs.readFileSync(filePath).toString()
                console.log("HTML", typeof html, html)

                var htmlWithSubPages = getSubPages(html)
                var htmlWithSubPagesAndLoops = resolveLoops(htmlWithSubPages, variables || {})
                var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables || {})
                if (_bodyUrl) {
                    var _body = getPage(_bodyUrl)
                    htmlWithVariables = interpolate(_body, { body: htmlWithVariables })
                }
                response.end(htmlWithVariables)
                // var fileReader = fs.createReadStream(filePath)
                // response.writeHead(200, { 'Content-Type': 'text/html' })
                // fileReader.on('error', (e) => {
                //     console.log("An error was handled in file router;", e)
                // })
                // .pipe(new Transform({
                //     transform(chunk, encoding, callback) {
                //         var htmlWithSubPages = getSubPages(chunk.toString())
                //         var htmlWithSubPagesAndLoops = resolveLoops(htmlWithSubPages, variables || {})
                //         console.log('c')
                //         var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables || {})
                //         if (_bodyUrl) {
                //             console.log('d')
                //             var _body = getPage(_bodyUrl)
                //             htmlWithVariables = interpolate(_body, { body: htmlWithVariables })
                //         }

                //         this.push(htmlWithVariables)
                //         callback()
                //     }
                // })
                // ).pipe(response)
                // fileReader.on('end', () => {response.end()} )
            }
        }
        else {
            return routesToFile = (request, response) => {
                // console.log("FILE PATH",filePath, request.headers)
                var agent = request.headers ? request.headers["user-agent"] : undefined;
                // console.log(agent)
                // Object.keys(request.headers).forEach(header => { console.log(header); if(header=='user-agent')console.log("!!!")})

                if (agent && agent.indexOf('Mac') != -1 && extention == 'mp4') {
                    // console.log("FILE PATH@",filePath, request.headers)
                    var file = fs.readFileSync(filePath)
                    //fs.readFile(filePath, (file) =>{
                    if (request.headers.range) {
                        var range = request.headers.range
                        var total = file.length
                        var parts = range.replace(/bytes=/, "").split("-")
                        var partialstart = parts[0]
                        var partialend = parts[1]

                        var start = parseInt(partialstart, 10)
                        var end = partialend ? parseInt(partialend, 10) : total
                        var chunksize = (end - start)
                        response.writeHead(206, {
                            "Content-Range": "bytes " + start + "-" + end + "/" + total,
                            "Accept-Ranges": "bytes",
                            "Content-Length": chunksize,
                            "Content-Type": "video/mp4"
                        });
                        response.writeHead(206)
                        response.end(file.slice(start, end))
                    }
                    //});
                }
                else {
                    // var filePath = path.join( _baseRoute, file); 
                    var fileReader = fs.createReadStream(filePath)
                    var memeType = getMemeType(filePath)
                    response.writeHead(200, { 'Content-Type': memeType })

                    fileReader.on('error', (e) => {
                        console.log("An error was handled in router;", e)
                    }).pipe(response)
                }
            }
        }

    }

    return {
        addRoute: (url, resource, variables) => {
            // console.log("route 2 added route", url)
            if (typeof url === 'string') {
                url = url.toLocaleLowerCase()
                if (resource) {
                    if (typeof resource === "string") _routes[url] = fileRouter(resource, variables) //routing back a file
                    else _routes[url] = resource; //routing to function
                }
                else _routes[url] = fileRouter(url)
                console.log("router", _name, "route added:", url, ":", _routes[url])
            }
            else if (isRegex(url)) {
                _regexRoutes[url] = resource
                console.log("router", _name, "regex route added:", url, ":", _regexRoutes[url])
            }
            // console.log("ROUTES", _routes)
        },
        addFolder: (folder) => {
            folders.push(folder)
        },
        setBody: (file) => {
            _bodyUrl = file
        },
        setNoRouteHandler: (funcHandler) => {
            _noRouteHandler = funcHandler
        },
        //links to subpages look like ^{}
        //getSubPages : (html) => html.replace(/\^{([^}]+)}/g,(_, pageName) => getPage(pageName)),
        setBaseRoute: (route) => {
            _baseRoute = route
            console.log("router", _name, "base route set to:", _baseRoute)
        },
        fileRouter: fileRouter,
        serve: (request, response) => {
            var url = request.url.toLocaleLowerCase()
            var baseUrl = url.split('?')[0]
            console.log("SERVING2 ", _name, baseUrl, _bodyUrl)
            var parts = baseUrl.split('/')
            parts.forEach(folder => {
                if (folders.includes(folder)) {
                    var folderRouter = fileRouter(baseUrl.substr(baseUrl.indexOf('/')))
                    folderRouter(request, response)
                    return
                }
            });
            var routeResolution = _routes[baseUrl]
            var firstMatchingRegexRoute = routeResolution ? false : matchesRegex(baseUrl)
            if (routeResolution) {
                console.log("ROUTE RES", routeResolution)
                routeResolution(request, response)
            }
            else if (firstMatchingRegexRoute) {
                console.log(firstMatchingRegexRoute)
                firstMatchingRegexRoute(request, response)
            }
            else if (_noRouteHandler) {
                _noRouteHandler(request, response)
            }
            else {
                console.log(_name, "contains no route to ", request.url, "in router", _name);
                console.log("possible routes are", _routes, folders);
                response.writeHead(404, { 'Content-Type': 'text/html' });
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