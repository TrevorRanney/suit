
var fs = require('fs');
var path = require('path');

var getMemeType = (file) => {
    var fileType = file.split('.').pop();
    var mime = {
        html: 'text/html',
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
    return type;
}


//variables look like ${}
// const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
const interpolate = require('./interpolater');

//should something be rendered {{}} //this would be a better syntax
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
    const _name = name || 'unnamed_router'
    const folders = []
    var _routes = {}
    var _regexRoutes = {}
    var _bodyUrl
    var _baseRoute = './'
    var _noRouteHandler
    var _basePath = ''

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
        const regexes = Object.keys(_regexRoutes);
        for (const regexString of regexes) {
            const pattern = regexString.slice(1, regexString.lastIndexOf('/'));
            const flags = regexString.slice(regexString.lastIndexOf('/') + 1);
            const regex = new RegExp(pattern, flags);
            if (new RegExp(regex).test(route)) {
                console.log('route matches!', regex, _regexRoutes[regexString])
                return _regexRoutes[regexString]
            }
        }
        console.log("no regex match")
        return false
    }

   
    const streamVideo = (request, response, filePath, fileSize) => {
      const rangeHeader = request.headers.range;
    
      if (!rangeHeader) {
        response.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(filePath).pipe(response);
        return;
      }
    
      const range = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      const start = parseInt(range[1], 10);
      const end = range[2] ? parseInt(range[2], 10) : Math.max(fileSize - 1, 1);
      const chunksize = (end - start) + 1;
    
      const fileStream = fs.createReadStream(filePath, { start, end });
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
    
      response.writeHead(206, headers);
      fileStream.pipe(response);
    }

    const fileRouter = (file, variables) => {
        var extention = file.split('.').pop()
        var filePath = path.join(_baseRoute, file)
        if (extention == 'html') {
            return function routesToRenderedHtml(request, response) {
                var html = fs.readFileSync(filePath).toString()

                //links to subpages look like ^{}
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
                if (extention == 'mp4' || extention == 'm4v' || extention == 'webm' ) {
                    const fileSize = fs.statSync(filePath).size;
                    streamVideo(request, response, filePath, fileSize)
                }
                else {
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
            if (typeof url === 'string') {
                url = url.toLocaleLowerCase()
                urlWithBase = _basePath + url
                if (resource) {
                    if (typeof resource === "string") {
                        _routes[url] = fileRouter(resource, variables) //routing back a file
                        _routes[urlWithBase] = fileRouter(resource, variables)
                    }
                    else {
                        _routes[url] = resource; //routing to function
                        _routes[urlWithBase] = resource;
                    }
                }
                else {
                    _routes[url] = fileRouter(url)
                    _routes[urlWithBase] = fileRouter(url)
                }
                console.log("router", _name, "route added:", url, ":", _routes[url])
            }
            else if (isRegex(url)) {
                _regexRoutes[url] = resource
                console.log("router", _name, "regex route added:", url, ":", _regexRoutes[url])
            }
            // console.log("ROUTES", _routes)
        },
        setName : (name) => {
            _name = name
        },
        addFolder: (folder) => {
            folders.push(folder)
        },
        setBasePath : (basePath) => {
            console.log("BASE PATH SET TO:", basePath)
            _basePath =  basePath
        },
        setBody: (file) => {
            _bodyUrl = file
        },
        setNoRouteHandler: (funcHandler) => {
            _noRouteHandler = funcHandler
        },
        setBaseRoute: (route) => {
            _baseRoute = route
            console.log("router", _name, "base route set to:", _baseRoute)
        },
        fileRouter: fileRouter,
        serve: (request, response) => {
            console.log('router2:', _name, "retrieving", request.url)
            var url = request.url.toLocaleLowerCase()
            var baseUrl = url.split('?')[0]
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
                console.log("route resolution:", routeResolution)
                routeResolution(request, response)
            }
            else if (firstMatchingRegexRoute) {
                firstMatchingRegexRoute(request, response)
            }
            else if (_noRouteHandler) {
                _noRouteHandler(request, response)
            }
            else {
                console.log(_name, "contains no route to ", request.url, "in router", _name);
                console.log("possible routes are", _routes, folders, _regexRoutes);
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
