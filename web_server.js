var http = require("http");
var server = http.createServer(function(request, response) {
	response.writeHead(200, {"Content-Type": "text/html"});
	//response.end('./public/realtor.html');
	//response.write("<a href='./public/realtor.html'>click</a>");
	response.write("I have no idea how to route to pages on server");
	response.end();
});

server.listen(81);
console.log("Server is listening");
