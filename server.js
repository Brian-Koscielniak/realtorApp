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

app.listen(1337);
console.log("Running on port 1337");

app.get('/', function(req, res){
	// These Variables will hold html content
	var addressForm, propList, tabs;

	// The function that will be called once all content is read. 
	function renderPage(){
		res.render("realtorApp.jade", {addressForm : addressForm,  propList : propList, tabs : tabs});
	}

	// Welcome to callback hell!
	fs.readFile(__dirname + '/public/addressForm.html', 'utf-8', function (err,data) {
		addressForm = data;
		fs.readFile(__dirname + '/public/propertyList.html', 'utf-8', function (err,data) {
			propList = data;
			fs.readFile(__dirname + '/public/tabs.html', 'utf-8', function (err,data) {
				tabs = data;
				renderPage();
			});
		});
	});
});
app.post("/rest", function(req, res){
	request(req.body.data, function (error, response, body) {
	  if (!error && response.statusCode === 200) {
	    res.send(body);
	  }
	});
});
app.get("*", function(req, res){
	res.set('Content-Type', 'text/html')
	res.send(new Buffer('<html><body>Nothing here. <a href="/">Back to Realtor Application</a></body></html>'));
});
