var httpServer = require("http");
var server = httpServer.createServer(function(request,response){
    response.writeHead(200,{"content-Type":"text/plain"});
    response.write('hello world');
    response.end();
})
server.listen(3000);