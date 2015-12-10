var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var Jade = require('jade');
var fs = require('fs');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine','jade');
app.engine('jade', Jade.__express);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Unless specified otherwide, server runs on port 3000
process.argv[2] ? port = process.argv[2] : port = 3000;
app.listen(port, function(){
	console.log('Server is running on port %d', port);
});

app.get('/', function(req, res){
	var tabs;

	// The function that will be called once all content is read. 
	function renderPage(){
		res.render("realtorApp.jade", {tabs : tabs});
	}
	fs.readFile(__dirname + '/public/tabs.html', 'utf-8', function (err,data) {
		tabs = data;
		renderPage();		
	});
});
app.post("/rest", function(req, res){
// Handle the request
	request(req.body.data, function (error, response, body) {
		if (!error && response.statusCode === 200) {
			res.send(body);
		}
	});
});
app.get("*", function(req, res){
// Stand in for 404
	res.set('Content-Type', 'text/html')
	res.send(new Buffer('<html><body>Nothing here. <a href="/">Back to Realtor Application</a></body></html>'));
});
