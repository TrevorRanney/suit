
var fs = require('fs');
var path = require('path');
const { Transform } = require('stream');

var _baseRoute = '';
var _routes = {};
var _name;

function getPage(pageName)
{
    var test = path.join(_baseRoute, pageName)
    var html = fs.readFileSync(test);
    var stringHtml = html.toString();
    return getSubPages(stringHtml);
}

const interpolate = (str, obj) => str.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
const getSubPages = (html) => html.replace(/\^{([^}]+)}/g,(_, pageName) => getPage(pageName));

class router
{
    constructor(name, baseRoute){
        _name = name;
        _baseRoute = baseRoute;
    }

    addRoute(url, resource, variables)
    {
        url = url.toLocaleLowerCase()
        if (resource){
            if(typeof resource === "string")_routes[url] = this.fileRouter(resource, variables); //routing back a file
            else _routes[url] = resource; //routing to function
        }
        else _routes[url] = this.fileRouter(url);
        console.log("router", _name, "caseless route added:", url, ":", _routes[url]);
    };

    fileRouter(file, variables)
    {
        if(file.split('.').pop() == 'html')
        {
            return function routesToRenderedHtml(request, response){
                var filePath = path.join( _baseRoute, file); 
                var fileReader = fs.createReadStream(filePath);
                fileReader.on('error', (e) =>
                {
                    console.log("An error was handled in router;", e)
                })
                .pipe(new Transform({
                        transform(chunk, encoding, callback) {
                            var htmlWithSubPages = getSubPages(chunk.toString());
                            var htmlWithVariables = interpolate(htmlWithSubPages, variables);
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
        var routeResolution = _routes["" + request.url];
        console.log({_routes})
        console.log(routeResolution)
        if (routeResolution)
        {
            routeResolution(request, response);
        }
        else{
            //We do nothing if the client sends us a request we don't know how to handle, I think that is like not existing :P
            console.log("No route to ", request.url, "in router", _name, "tried", routeResolution);
            response.end();// make this handle error method that is passed in?
        }
    };
};

module.exports = router;