var router = require('../../lib/router')('unit-test-router');

describe( "The router unit tests", () => {
    beforeEach( () => {
        router = require('../../lib/router')('unit-test')
    });

    it("can create a router with no name", () => {
        require('../../lib/router')()
    })

    it("can navigate to a route function", () => {
        var testUrlReached = false
        router.addRoute('test',() => {testUrlReached = true} )
        router.serve({url:'test'},{ })
        expect(testUrlReached).toBe(true)
    });

    it("can serve a file", () => {
        router.addRoute('test.html','spec/server/test-files/folder/test.html')
        var result, status
        var response = {end:(status)=>{result=status}, writeHead:(s)=>{status=s} }
        router.serve({url:'test.html'}, response)
        expect(result).toBe(`<div>In a folder :)</div>`)
        expect(status).toBe(200)
    })

    it("can handle an undefined route by default with a 404", () => {
        var routeStatus = 0
        router.serve({url:'unknown'},{writeHead:(status)=>{routeStatus = status}, end:()=>{} })
        expect(routeStatus).toBe(404)
    })

    it("info console log can be turned off", () => {
        router.turnInfoOff() // this test is mainly for code coverage at the moment a result needs to be checked
    })

    it("can handle an undefined route with a custom function", () => {
        var noRouteHandlerReached = false
        router.setNoRouteHandler(() => {noRouteHandlerReached = true})
        router.serve({url:'unknown'},{})
        expect(noRouteHandlerReached).toBe(true)
    })

    it("can match a regex route", () => {
        var regexRouteReached = false
        router.addRoute(/regex/g,() => {regexRouteReached = true})
        router.serve({url:'regex'},{})
        expect(regexRouteReached).toBe(true)
    })

    it("can match a folder", () => {
        var result, status
        var response = {end:(r)=>{result=r}, writeHead:(s)=>{status=s}}
        router.setBaseRoute('spec/server/test-files/')
        router.addFolder('folder')
        router.serve({url:'/folder/test.html'},response)
        expect(result).toBe(`<div>In a folder :)</div>`)
        expect(status).toBe(200)
    })

    // it("can change base path", async () => {
    //     router.setBaseRoute('spec/server/test-files')
    //     router.addRoute('/test.css')
    //     var resultStatus, resultHeaders, resultWrite
    //     var response = {on:()=>{}, once:()=>{}, emit:()=>{}, writeHead:()=>{}}
    //     response.writeHead = (status, headers) => { resultStatus = status, resultHeaders = headers}
    //     response.write = (r) => {resultWrite = r}
    //     router.serve({url:'/test.css'},response)
    //     expect(resultStatus).toBe(200)
    //     expect(resultHeaders).toBe(`{ Content-Type: 'text/css' }`)
    //     // expect(resultWrite).toContain(`color: red;`)
    // })

    it("can set a default body to a file", () => {
        var helloWorldHTML = ''
        var status
        router.setBaseRoute('example/router/')
        router.setBody('hello-world.html')
        router.addRoute('test.html')
        router.serve({url:'test.html'},{end:(html)=>{helloWorldHTML = html}, writeHead:(s)=>{status=s} })
        expect(status).toBe(200)
        expect(helloWorldHTML).toBe('Hello World')
    });

    it("can render a html in a body/parent", () => {
        var html = ''
        var stat
        router.setBody('spec/server/test-files/test-body.html')
        router.addRoute('test','spec/server/test-files/test-simplest-component.html', {number: 22})
        router.serve({url:'test'},{end:(h)=>{html = h}, writeHead:()=>{} })
        expect( html.replace(/\s+/g, '') ).toBe(`<!DOCTYPEhtml><html><body>22</body></html>`)
        // expect( stat ).toBe(200)
    });

    it("can set base url path", () => {
        var helloWorldHTML = ''
        var status
        router.setBaseRoute(process.cwd()+ '/example/router/')
        router.setBasePath('/urlpath/')
        router.setBody('hello-world.html')
        router.addRoute('test.html')
        router.serve({url:'/urlpath/test.html'},{end:(html)=>{helloWorldHTML = html}, writeHead:(s)=>{status=s}})
        expect(helloWorldHTML).toBe('Hello World')
        expect(status).toBe(200)
    });

    // // xit("can set base url path with capital letters", () => {
    // //     var helloWorldHTML = ''
    // //     router3.setBaseRoute(process.cwd()+ '/example/router/')
    // //     router3.setBasePath('/URLPATH/')
    // //     router3.setBody('hello-world.html')
    // //     router3.addRoute('test.html')
    // //     router3.serve({url:'/URLPATH/test.html'},{end:(html)=>{helloWorldHTML = html},writeHead:()=>{}})
    // //     expect(helloWorldHTML).toBe('Hello World')
    // // });

    it("can set base url path", () => {
        var helloWorldHTML = ''
        router.setBaseRoute(process.cwd()+ '/example/router/')
        router.setBasePath('/urlpath/')
        router.setBody('hello-world.html')
        router.addRoute('test.html')
        router.serve({url:'/urlpath/test.html'},{end:(html)=>{helloWorldHTML = html}, writeHead:()=>{}})
        expect(helloWorldHTML).toBe('Hello World')
    });

    it("can stream a video, get a range or a start position", () => {
        var headers
        const response = {writeHead:(h)=>{headers=h}, on:()=>{}, once:()=>{}, emit:()=>{}}
        router.addRoute('spec/server/test-files/test.mp4') // FYI test.mp4 is an fake empty file 
        router.serve({headers:{},url:'spec/server/test-files/test.mp4'}, response)
        router.serve({headers:{ range: 'bytes=100-200' }, url:'spec/server/test-files/test.mp4'}, response)
        router.serve({headers:{ range: 'bytes=1-' }, url:'spec/server/test-files/test.mp4'}, response)
        expect(headers).toBe(206)
    })

    it("can serve a file that has subpages with forloops", () => {
        var complexVariable = {
            stuff: ['world','hello'],
            things: { stuff: ['XD']},
            user: {videos: [{description: "video1", mp4:"data"},{description: "v2"}]}
        };
        router.setBaseRoute('./example/complex-data')
        router.addRoute('/', 'complex.html', complexVariable )
        var result
        var response = {end : (r) => { result = r}, writeHead:()=>{}}
        router.serve({url:'/'}, response)
        expect( result.replace(/\s+/g, '') ).toBe(`<!DOCTYPEhtml><html><body><div>XD</div><div>helloworld</div><div><div>video1</div><div>v2</div></div></body></html>`)
    })

    it("a component link can have a variable in it", () => {
        var expectedToBeRenderedInFinalComponent = "Nice sub components can be loaded from variables!"
        router.addRoute('test','spec/server/test-files/test-var-in-sub-path.html', {route_path: 'spec/server/test-files/test-simplest-component', number: expectedToBeRenderedInFinalComponent})
        var result
        var response = { end:(status)=>{result=status}, writeHead:()=>{} }
        router.serve({url:'test'}, response)
        expect(result).toBe(expectedToBeRenderedInFinalComponent)
    })

    it("a component can have a parameter passed into it in the html", () => {
        router.setBaseRoute('spec/server/test-files/')
        router.addRoute('/', 'test-sub-parameter.html' )
        var result
        router.serve({url:'/'}, { end : (r) => { result = r}, writeHead:()=>{} }  )
        expect( result ).toBe(`12345`)
    })

    it("doesn't break when routing to non-existing file (non html)", () => {
        router.addRoute('/', 'what-is-this-dev-thinking.poop' )
        var  routeStatus, error
        router.serve({url:'/'}, { writeHead:(status, headers)=>{routeStatus = status; error = headers}, end:()=>{} }) 
        expect( routeStatus ).toBe(404)
        expect( error.error ).toBe(`not found`)
    })

    it("unknown mime type defaults to text/plain", () => {
        router.addRoute('/','spec/server/test-files/textfile.md')
        var routeStatus, contentType
        router.serve({url:'/'}, { writeHead:(status, headers)=>{ routeStatus = status; contentType = headers }, on:()=>{}, once:()=>{}, emit:()=>{} }) 
        expect( routeStatus ).toBe(200)
        expect( contentType['Content-Type']  ).toBe(`text/plain`)
    })

    it("can run requests through middleware", () => {
        var middlewareReached = false
        const testMiddleware = (request, response) => {middlewareReached = true}
        router.addMiddleware(testMiddleware)
        router.addRoute('test',() => {})
        router.serve({url:'test'},{})
        expect(middlewareReached).toBe(true)
    })

});
