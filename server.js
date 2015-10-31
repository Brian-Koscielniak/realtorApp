var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendFile("realtor.html", {'root': __dirname + "/public"});
});
app.post("/rest", function(req, res){
	request(req.body.data, function (error, response, body) {
	  if (!error && response.statusCode === 200) {
	    res.send(body);
	  }
	});
});
app.listen(3000);
console.log("Running on port 3000");
