// I don't know how this works, but it does....
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(80); // I change from port 8080 to port 80

console.log("Server is listening...");
