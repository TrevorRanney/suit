
var fs = require('fs');
var path = require('path');

var _baseRoute = '';
var _routes = {};
var _name;

class router
{
    constructor(name, baseRoute){
        _name = name;
        _baseRoute = baseRoute;
    }

    addRoute(url, resource)
    {
        url = url.toLocaleLowerCase()
        if (resource){
            if(typeof resource === "string")_routes[url] = this.htmlRouter(resource); //wrap in function that returns file
            else _routes[url] = resource;
        }
        else _routes[url] = htmlRouter(url);
        console.log("router", _name, "caseless route added:", url, ":", _routes[url]);
    };

    htmlRouter(file){
        return function routesToFile(request, response){
            var test = path.join( _baseRoute, file); 
            var fileReader = fs.createReadStream(test);
            fileReader.on('error', (e) =>
            {
                console.log("An error was handled in router;", e)
            });
            fileReader.pipe(response);
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
        }
    };
};

module.exports = router;