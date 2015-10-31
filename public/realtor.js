/* Tab scripts */
var tabList = document.querySelectorAll("#tabSection li");
var tabContent = document.querySelectorAll("#tabSection div");
for (i=0;i<tabList.length;i++){
	tabList[i].addEventListener("click",toggleTab);
}
function toggleTab(){
	for (i=0;i<tabList.length;i++){
		tabContent[i].className = "tabHide";
		tabList[i].className = "";
	}
	/* I would perfer to index rather than hard code numbers onto <li>. Do that */
	tabContent[Number(this.id)-1].className = "tab";
	this.className = "currentTab";
}

/* Loan calculator scripts */
function calcMonthlyPayments(){
	{ // This code block removes all error messages every function call, to prevent duplicate error messages.
		var errNodeList = document.querySelectorAll("#loanForm p");
		for (var i=0; i<errNodeList.length; i++){
			errNodeList[i].parentNode.removeChild(errNodeList[i]);
		}	
	}
	var loanDataField = document.querySelector("#loanForm input:nth-of-type(1)");
	var interestDataField = document.querySelector("#loanForm input:nth-of-type(2)");
	var monthDataField = document.querySelector("#loanForm input:nth-of-type(3)");
	var userDataArr = [loanDataField, interestDataField, monthDataField];
	var isErr = false;
	
	for (var i=0; i<userDataArr.length; i++){
	/* Error handling for loanForm*/
	// TODO: What if the user enters punctuation in the number (example 1,000.50) or addeds the number as a string "100" you must check for these aswell.
		try { 
			if (userDataArr[i] === interestDataField){
				// Interest special case
				if (userDataArr[i].value < 0.1) {isErr = true; throw "<-- You must enter a number greater than or equal to .1"}
			} else { 
				if (userDataArr[i].value <= 0) {isErr = true; throw "<-- You must enter a positive whole number greater than zero"}
			}
		}
		catch(err) {
			var errPara = document.createElement("p");
			errPara.appendChild(document.createTextNode(err));
			userDataArr[i].parentNode.insertBefore(errPara, userDataArr[i].nextSibling);
		}
	}
	var resultSpan = document.querySelectorAll("#tabSection span");
	for (var i=0; i<resultSpan.length; i++){ // Removes previous loanForm calculator output, to prevent duplicates
		resultSpan[i].parentNode.removeChild(resultSpan[i]);
	}
	document.querySelector("#tabSection div:nth-of-type(2)").appendChild(document.createElement("span"));
	if (isErr == false){ // If isErr is true then loanForm data was not valid, do not calculate loan
		document.querySelector("#tabSection span").appendChild(document.createTextNode("Next Payment: $"+Calculator.compoundInterest(loanDataField.value, interestDataField.value, monthDataField.value)));
	}
}
var Calculator = {
	simpleInterest : function(P,R,T){
	/* Where P is the principal or loan amount. R is the interest rate, expressed as a percent. T is the time peried in 
	months the loan must be paid */
		P = Number(P); // Explict data type conversion ensures math operations perform correctly
		R = Number(R);
		T = Number(T);
		var I = P*(R/100)*(T/12);
		return Math.round(((P+I)/T) * 100) / 100; // Simple technique to bring floating points figure down to two  
	},
	compoundInterest : function(P,R,T){
		P = Number(P); 
		R = Number(R);
		T = Number(T);
		// Look at this line of code below. It took me like 3 hours to figure out mortgage math, and 2 more to write it in JavaScript!
		return this.toDollarFormat(P*((1-(1/(1+((R/100)/12))))/((1/(1+((R/100)/12)))-Math.pow((1/(1+((R/100)/12))),(T+1)))));
		// Pro-tip: the caret( ^ ) symbol in JavaScript does NOT mean mathmatical power, use Math object pow method instead
	},
	toDollarFormat : function(n){
		console.log(n);
		// Round to penny
		n = Math.round(n*100)/100;	
		// Find '.' if . and only 1 after add a zero, if no . move on
		// find '.' or end of string count 3 back recursivly add comma every three
		return n;
	}
}

/* google map scripts */
// This script was STOLE!
/*
function initialize() {
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(42.5403, -84.5463),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCanvas, mapOptions)
}
google.maps.event.addDomListener(window, 'load', initialize);
*/

/* Zillow Ajax scripts */
var afs = document.getElementById('afs');
var response = document.getElementById('response');
var userInput = document.querySelectorAll('#addressForm input');

afs.addEventListener('click', sendRequest, false);

function sendRequest(){
	var zillowUrl = buildUrl();
	console.log(zillowUrl);
	var data = encodeURIComponent(zillowUrl);
/*
	var data = "";
	for (var i=0; i<userInput.length-1;i++){
		data += userInput[i].value;
		data += "^^";
	}
*/
	console.log(data);
	Ajax.sendRequest('/rest', handleRequest, data);
}
var zillowXml;
function handleRequest(req){
	var azd = document.getElementById('allZillowData');
	azd.innerHTML = req.responseText;
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);

	function textToXML (text) {
	      try {
	        var xml = null;
	        if ( window.DOMParser ) {
	          var parser = new DOMParser();
	          xml = parser.parseFromString( text, "text/xml" );
	          var found = xml.getElementsByTagName( "parsererror" );
	          if ( !found || !found.length || !found[ 0 ].childNodes.length ) {
	            return xml;
	          }
	          return null;
	        } else {
	          xml = new ActiveXObject( "Microsoft.XMLDOM" );
	          xml.async = false;
	          xml.loadXML( text );
	          return xml;
	        }
	      } catch (e) {
	        console.log(e.error)
	      }
	}
}
function buildUrl(){
	var zwsid = "X1-ZWz1a2t5ohptzf_4pyss";
	var address = userInput[0].value;
	var citystatezip = userInput[1].value + "+" + userInput[2].value + "+" + userInput[3].value;
	// Add a looping function to remove or replace all spaces	
	return "".concat("http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=",zwsid,"&address=",address,"&citystatezip=",citystatezip);
}


/* Property list scripts */
function addProperty(){
	var adr = zillowXml.getElementsByTagName('text')[0].innerHTML;
	response.innerHTML = adr;
}
