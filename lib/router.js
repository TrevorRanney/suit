
const fs = require('fs');
const path = require('path');

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


// variables look like {{}}
const interpolate = require('./interpolater');
const resolveLoops = require('./forlooper');

module.exports = (name) => {
    var _name = name || 'unnamed_router'
    const folders = []
    var _routes = {}
    var _regexRoutes = {}
    var _bodyUrl
    var _baseRoute = './'
    var _noRouteHandler
    var _basePath = ''
    var _middleware = []
    var infoOn = true

    const turnInfoOff = () => {
        infoOn = false
    }

    const getSubPages = (html, variables) => {
        const subPageRegex = /\[\[(.*?)\]\]/g
        return html.replace(subPageRegex, (_, pageName) => getPage(pageName, variables))
    }

    const getPage = (pageNameNoVars, variables) => {
        var pageName = interpolate(pageNameNoVars, variables || {})
        // Regular expression to match text between parentheses after page name
        const regex = /\((\w+):\s*([^)]+)\)/g;
        const extractedValues = {};
        let match;
        while ((match = regex.exec(pageName))) {
            const variableName = match[1];
            const variableValue = match[2];
            extractedValues[variableName] = variableValue;
        }
        pageName = pageName.replace(/\((.*?)\)/g, '')
        const pagePath = path.join(_baseRoute, pageName)
        const html = fs.readFileSync(pagePath)
        var stringHtml = html.toString()
        const vars = Object.assign({}, extractedValues, variables)
        stringHtml = resolveLoops(stringHtml, variables || {})
        stringHtml = interpolate(stringHtml, vars)
        return getSubPages(stringHtml, variables)
    }

    const matchesRegex = (route) => {
        const regexes = Object.keys(_regexRoutes);
        for (const regexString of regexes) {
            const pattern = regexString.slice(1, regexString.lastIndexOf('/'));
            const flags = regexString.slice(regexString.lastIndexOf('/') + 1);
            const regex = new RegExp(pattern, flags);
            if (new RegExp(regex).test(route)) {
                if(infoOn)console.log('route matches!', regex, _regexRoutes[regexString])
                return _regexRoutes[regexString]
            }
        }
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
            return (request, response) => {
                var html = fs.readFileSync(filePath).toString()
                var htmlWithSubPages = getSubPages(html, variables)
                var htmlWithSubPagesAndLoops = resolveLoops(htmlWithSubPages, variables || {})
                var htmlWithVariables = interpolate(htmlWithSubPagesAndLoops, variables || {})
                if (_bodyUrl) {
                    htmlWithVariables = getPage(_bodyUrl, { body: htmlWithVariables })
                }
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.end(htmlWithVariables)
            }
        }
        else {
            return routesToFile = (request, response) => {
                if (extention == 'mp4' || extention == 'm4v' || extention == 'webm') {
                    const fileSize = fs.statSync(filePath).size;
                    streamVideo(request, response, filePath, fileSize)
                }
                else {
                    const fileExists = fs.existsSync(filePath)
                    if (fileExists) {
                        var fileReader = fs.createReadStream(filePath)
                        var memeType = getMemeType(filePath)
                        response.writeHead(200, { 'Content-Type': memeType })
                        fileReader.pipe(response)
                    }
                    else {
                        console.error('File does not exist', filePath);
                        response.writeHead(404, { 'error': 'not found' }) // doesn't seem to do anything
                        response.end()
                    }

                }
            }
        }
    }

    return {
        _name,
        turnInfoOff,
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
                if(infoOn)console.log("router", _name, "route added:", urlWithBase, ":", _routes[url])
            }
            else { // if (isRegex(url) pretty sure it can only be here if it is regex
                _regexRoutes[url] = resource
                if(infoOn)console.log("router", _name, "regex route added:", url, ":", _regexRoutes[url])
            }
        },
        addFolder: (folder) => {
            folders.push(folder)
        },
        // note this must be small letters, or it fails to match the route :O
        setBasePath: (basePath) => {
            if(infoOn)console.log("BASE PATH SET TO:", basePath)
            _basePath = basePath
        },
        setBody: (file) => {
            _bodyUrl = file
        },
        setNoRouteHandler: (funcHandler) => {
            _noRouteHandler = funcHandler
        },
        setBaseRoute: (route) => {
            _baseRoute = route
            if(infoOn)console.log("router", _name, "base route set to:", _baseRoute)
        },
        fileRouter: fileRouter,
        serve: (request, response) => {
            if (_middleware) {
                for (const func of _middleware) {
                    func(request, response)
                }
            }
            var url = request.url.toLocaleLowerCase()
            var baseUrl = url.split('?')[0]
            var parts = baseUrl.split('/')
            var folderRoute;
            parts.forEach(folder => {
                if (folders.includes(folder)) {
                    folderRoute = baseUrl.substr(baseUrl.indexOf('/'))
                }
            });
            var routeResolution = _routes[baseUrl]
            var firstMatchingRegexRoute = routeResolution ? false : matchesRegex(baseUrl)
            if (folderRoute) {
                var folderRouter = fileRouter(folderRoute)
                folderRouter(request, response)
            }
            else if (routeResolution) {
                routeResolution(request, response)
            }
            else if (firstMatchingRegexRoute) {
                firstMatchingRegexRoute(request, response)
            }
            else if (_noRouteHandler) {
                _noRouteHandler(request, response)
            }
            else {
                if(infoOn)console.log(_name, "contains no route to ", request.url, "in router", _name);
                if(infoOn)console.log("possible routes are", _routes, folders, _regexRoutes);
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
        },
        addMiddleware: (middleware) => {
            _middleware.push(middleware)
        }
    }
};

