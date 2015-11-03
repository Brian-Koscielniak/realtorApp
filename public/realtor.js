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
	var result = document.querySelectorAll("#tabSection p");
	for (var i=0; i<result.length; i++){ // Removes previous loanForm calculator output, to prevent duplicates
		result[i].parentNode.removeChild(result[i]);
	}
	if (isErr == false){ // If isErr is true then loanForm data was not valid, do not calculate loan
	//console.log(document.getElementById("loanTotal"));
		var resultElem = document.createElement("p");
		var totalTxt = document.createTextNode("Next Payment: $"+Calculator.compoundInterest(loanDataField.value, interestDataField.value, monthDataField.value));
		resultElem.appendChild(totalTxt);
		var loanForm = document.getElementById("loanForm");
		loanForm.appendChild(resultElem);
	} else {
		console.log("something went wrong");
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
		// Round to penny
		n = Math.round(n*100)/100;	
		// Find '.' if . and only 1 after add a zero, if no . move on
		// find '.' or end of string count 3 back recursivly add comma every three
		console.log(n);
		return n;
	}
}

/* google map scripts */
// 	
var lat = 40, lng = -80;

function mapInit() {
// These code are provided by the Api and are needed for it to work.
	var mapCanvas = document.getElementById('map'); // This is mine
	var mapOptions = {
		center: new google.maps.LatLng(lat, lng), // The 'lat' and 'lng' var are also mine
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	var map = new google.maps.Map(mapCanvas, mapOptions)
}
google.maps.event.addDomListener(window, 'load', mapInit);


/* Zillow Ajax scripts */
var zillowXml;
var propertyInput = document.querySelectorAll('#addressForm input');
var afs = document.getElementById('afs'); // "Address Form Sumbit" button
afs.addEventListener('click', sendSearch, false);

function sendSearch(){
	// Zillow wants a url, so one is made
	var zillowUrl = buildUrl("search"); 

	// This is needed.....? For reasons.
	var data = encodeURIComponent(zillowUrl);

	// Routing powers Activate!
	Ajax.sendRequest('/rest', handleSearch, data);
}
	
function sendComps(){
	// Zillow wants a url, so one is made
	var zillowUrl = buildUrl("comps");

	// This is needed.....? For reasons.
	var data = encodeURIComponent(zillowUrl);

	// Routing powers Activate!
	Ajax.sendRequest('/rest', handleComps, data);
}

function handleSearch(req){
	// Getting that Zillow back, Mmm mmmm tasty!
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);

	lat = Number(zillowXml.getElementsByTagName('latitude')[0].innerHTML);
	lng = Number(zillowXml.getElementsByTagName('longitude')[0].innerHTML);
	sendComps();
	mapInit();
}

function handleComps(req){
	var azd = document.getElementById('allZillowData'); // PRODUCTION CODE: DELETE 
	azd.innerHTML = req.responseText; // PRODUCTION CODE: DELETE 

	// Getting them Comps, yeah yeah boi!!
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);
	
	buildCompsTable();
}

function buildUrl(service){
	// I probably shouldn't have this id just sitting around client side...
	var zwsid = "X1-ZWz1a2t5ohptzf_4pyss";
	if (service === "search"){
		// Get user property input 
		var address = propertyInput[0].value;
		var citystatezip = propertyInput[1].value + "+" + propertyInput[2].value + "+" + propertyInput[3].value;

		// It seems Zillow is smart enough to not need to replace space with +. I'll let them figure it out!
		return "".concat("http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=",zwsid,"&address=",address,"&citystatezip=",citystatezip);

	} else if (service === "comps"){
		//
		return "".concat("http://www.zillow.com/webservice/GetComps.htm?zws-id=",zwsid,"&zpid=",zillowXml.getElementsByTagName('zpid')[0].innerHTML,"&count=15");
	}
}

function textToXML (text) {
/* This function is code provided by Shaper, becuase well... What am I going to do different? */
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


/* Property list scripts */
// Set up the 'Add Properties To List' feature.
var zpl = document.getElementById('zpl'); // "Zillow Property List", is a page div that will be populated with a single list
var addBTN = document.getElementById("addBTN");	
addBTN.addEventListener("click", addProperty, false);

function addProperty(){
	// The property information must be extracted from Zillow XML, and converted to JSON
	var property = {
		"street":zillowXml.getElementsByTagName('street')[0].innerHTML,
		"city":zillowXml.getElementsByTagName('city')[0].innerHTML,
		"state":zillowXml.getElementsByTagName('state')[0].innerHTML,
		"zipcode":zillowXml.getElementsByTagName('zipcode')[0].innerHTML
		};

	// This will place that property information into local web storage using the Zillow 'zpid' number as the key.
	localStorage[zillowXml.getElementsByTagName('zpid')[0].innerHTML] = JSON.stringify(property);

	buildPropertyList();
}

function removeProperty(){
/* Remove property feature works great, and takes minimal code, alls that has to be done is unstore the property from the local web 
storage and rebuild the page elements. Note that 'this.parentNode.id' is this key associated with the local storage value */
	localStorage.removeItem([this.parentNode.id]);
	buildPropertyList();
}

function viewProperty(){
	// Parse out the data into usable format.
	var property = JSON.parse(localStorage[this.parentNode.id])
	
	// Reset the address form data, with data from parsed local storage.
	propertyInput[0].value = property['street'];
	propertyInput[1].value = property['city'];
	propertyInput[2].value = property['state'];
	propertyInput[3].value = property['zipcode'];

	// Re-send Zillow Ajax request
	sendSearch();
}

function buildPropertyList(){
	// Duplicates can be prevented, simply by set the content to nothing and rebuilding all content everytime function is called.
	zpl.innerHTML = "";

	// Creating the list element
	var propertyList = document.createElement('ul');

	// Iterate through localStorage for the purpose of adding a list item for every property stored.
	for (i=0; i<localStorage.length;i++){
		// Because the property information was "stringify'd" it must be parsed so it can be displayed
		var property = JSON.parse(localStorage[localStorage.key(i)])
		property = "".concat(property['street']," ",property['city']," ",property['state']," ",property['zipcode']);

		// Setting up the 'view' button.
		var viewBTN = document.createElement('span')
		viewBTN.appendChild(document.createTextNode("[ view ] "));
		viewBTN.addEventListener('click', viewProperty, false);

		// Setting up the 'remove' button
		var removeBTN = document.createElement('span')
		removeBTN.appendChild(document.createTextNode("[ remove ] "));
		removeBTN.addEventListener('click', removeProperty, false);

		// Creating the list item
		var li = document.createElement('li');
		li.setAttribute('id', localStorage.key(i)); // This page element is associated with the zpid, for later 'remove' feature
		li.appendChild(viewBTN);
		li.appendChild(removeBTN);
		li.appendChild(document.createTextNode(property));

		// Adding the item to the list
		propertyList.appendChild(li);
	}

	// And of course, appending the property list to the page.
	zpl.appendChild(propertyList);
}
(function(){
/* This self-invoking anonymous function's purpose is to populate the 'My Properties List'. By having this bit of code, the 'My 
Properties List' section will always contain any zillow data stored in local storage, even on page reload, multiple tabs/windows, etc. */
	buildPropertyList();
})();

/* Comps Table Scripts */
function buildCompsTable(){
console.log("build call");
	var compsBody = document.querySelector("#compsTable tbody");
	compsBody.innerHTML = "";
	var zillowCompsArr = (zillowXml.getElementsByTagName("comp"));
	for (i=0;i<zillowCompsArr.length;i++){
		var row = document.createElement("tr");
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[0].innerHTML,"</td>"); // This will get the value Street from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[1].innerHTML,"</td>"); // This will get the value City from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[2].innerHTML,"</td>"); // This will get the value State from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[3].innerHTML,"</td>"); // This will get the value Zip from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[3].childNodes[0].innerHTML,"</td>"); // This will get the value Amount from Zillow Comps Xml
		compsBody.appendChild(row);
	}
}
