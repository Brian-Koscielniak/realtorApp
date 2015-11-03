///////////////////////////////////////////////////////////////////////////////
// Tabs Scripts ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var tabList = document.querySelectorAll("#tabSection li");
var tabContent = document.querySelectorAll("#tabSection div");
for (i=0;i<tabList.length;i++){
	tabList[i].addEventListener("click",toggleTab);
}
function toggleTab(e){
	// Reset the class names of the tabs / tabs content.
	for (i=0;i<tabList.length;i++){
		tabContent[i].className = "tabHide";
		tabList[i].className = "";
	}

	// param 'e' will evaluate to true if it was an event that directly called this function
	if (e){ // In this way a user can invoke the toggle
		tabContent[Number(this.id)-1].className = "tab";
		this.className = "currentTab";

	// If this function is call and no param is  passed, then 'e' is false(undefined), and change tab to the first one
	} else { // In this way a feature can invoke the toggle
		tabContent[0].className = "tab";
		tabList[0].className = "currentTab";
	}

	// The loan calculator needs to be cleared when the tab is clicked.
	clearCalc();
}





///////////////////////////////////////////////////////////////////////////////
// Loan Calculator Scripts ////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Store the loan input data in variables
var resultElem = document.getElementById("loanTotal");
var loanDataField = document.querySelector("#loanForm input:nth-of-type(1)");
var interestDataField = document.querySelector("#loanForm input:nth-of-type(2)");
var monthDataField = document.querySelector("#loanForm input:nth-of-type(3)");
var userDataArr = [loanDataField, interestDataField, monthDataField];

function calcMonthlyPayments(){
	// Set err to false every function call
	var err = false;
	
	// Calling clearCalc to clear out error messages
	clearCalc(true);

	// Look for errors
	for (var i=0; i<userDataArr.length; i++){
		try { 
			if (userDataArr[i] === interestDataField){
				// Interest special case
				if (userDataArr[i].value < 0.1 || isNaN(userDataArr[i].value)) {err = true; throw "<-- You must enter a number greater than or equal to .1"}
			} else { 
				if (userDataArr[i].value <= 0 || isNaN(userDataArr[i].value)) {err = true; throw "<-- You must enter a positive whole number greater than zero"}
			}
		}
		catch(err) {
			// When there is an error, make an 'p' element...
			var errPara = document.createElement("p");

			// ... place the error message inside the 'p' and...
			errPara.appendChild(document.createTextNode(err));

			// ... insert that 'p' next to the corresponding input.
			userDataArr[i].parentNode.insertBefore(errPara, userDataArr[i].nextSibling);
		}
	}

	// Only calculate and append elements if no errors occur
	if (!err){

		// Caluclate the results and innerHTML it in
		resultElem.innerHTML = "Next Payment: "+Calculator.compoundInterest(loanDataField.value, interestDataField.value, monthDataField.value);
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
		P = Number(P); // Explict data type conversion ensures math operations perform correctly
		R = Number(R);
		T = Number(T);

		// This is the compound interest formula, JavaScipt style (all converted to dollar format)
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

function clearCalc(onlyErr){
	// Clear out all error messages off of the UI
	var errNodeList = document.querySelectorAll("#loanForm p");
	for (var i=0; i<errNodeList.length; i++){
		errNodeList[i].parentNode.removeChild(errNodeList[i]);
	}	

	// If anything is passed, Break out of this function if ONLY errors and NOT inputs are to be cleared
	if(onlyErr){return};
	
	// Clear out the input fields on the calculator
	for (i=0;i<userDataArr.length;i++){
		userDataArr[i].value = "";
	}	

	resultElem.innerHTML = "";
	loanDataField.focus();
}





///////////////////////////////////////////////////////////////////////////////
// Map Scripts ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var propertyPosition = {lat: 0, lng: 0};
var mapCanvas = document.getElementById('map'); 

// These code are provided by the Api and are needed for it to work.
function mapInit() {
	var mapOptions = {
		center: new google.maps.LatLng(40, -80),
		zoom: 12,
		//mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	/*
	var map = new google.maps.Map(mapCanvas, mapOptions)
	var marker = new google.maps.Marker({
		position: propertyPosition,
		map: map,
	});
	*/
}





///////////////////////////////////////////////////////////////////////////////
// Zillow Ajax Scripts ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var zillowXml;
var propertyInput = document.querySelectorAll('#addressForm input');
var afs = document.getElementById('afs'); // "Address Form Sumbit" button
afs.addEventListener('click', function(){sendRequest("search")}, false);

function sendRequest(service){
	// Clear out property error on form submit
	clearPropAddErr();

	// Displaying info messages
	mapCanvas.innerHTML = "Getting information please wait...";

	// toggleTabs default is to switch to the first tab("Map").
	toggleTab();

	// Focus in on the 'Address' input elem
	propertyInput[0].focus();	
	
	// Build a url based on the 'reqest type'; either search or comps.
	var zillowUrl = buildCall(service); 

	// This is needed.....? For reasons.
	var data = encodeURIComponent(zillowUrl);

	// Routing powers Activate! Notice the ternary based on the param 'service' 
	Ajax.sendRequest('/rest', service=="search" ? handleSearch : handleComps, data);
}

function handleSearch(req){
	// Getting that Zillow back, Mmm mmmm tasty!
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);

	// Check the message code from zillow. '0' seems to be the good code, so if it's not that, error message.
	if (zillowXml.getElementsByTagName('code')[0].innerHTML != "0"){
		// Displaying error messages
		mapCanvas.innerHTML = "We are sorry, there is no map information for the address you entered."

		// toggleTabs default is to switch to the first tab("Map").
		toggleTab();
	
	// If it's not, not '0' it must be '0'! Do the thing!
	} else {
		// Set up the map 
		propertyPosition.lat = Number(zillowXml.getElementsByTagName('latitude')[0].innerHTML); 
		console.log( Number(zillowXml.getElementsByTagName('latitude')[0].innerHTML))
		propertyPosition.lng = Number(zillowXml.getElementsByTagName('longitude')[0].innerHTML);
		mapInit();

		// When the search comes back it will imediately go to retrieve the comparision data
		sendRequest("comps");
	}
}

function handleComps(req){
	// Getting them Comps, yeah yeah boi!!
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);
	
	// Build that comps table..
	buildCompsTable();
}

function buildCall(service){
	var zwsid = "X1-ZWz1a2t5ohptzf_4pyss";
	if (service === "search"){
		// Get user property input 
		var address = propertyInput[0].value;
		var citystatezip = propertyInput[1].value + "+" + propertyInput[2].value + "+" + propertyInput[3].value;

		// It seems Zillow is smart enough to not need to replace space with +. I'll let them figure it out!
		return "".concat("http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=",zwsid,"&address=",address,"&citystatezip=",citystatezip);

	} else if (service === "comps"){
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





///////////////////////////////////////////////////////////////////////////////
// Property List Scripts //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Set up the 'Add Properties To List' feature.
var zpl = document.getElementById('zpl'); // "Zillow Property List", is a page div that will be populated with a single list
var addBTN = document.getElementById("addBTN");	
addBTN.addEventListener("click", addProperty, false);

function addProperty(){
	clearPropAddErr();

	// Check to see if there is anything in zillowXml Variable, if so do the thing
	if (zillowXml){
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

	// If there is nothing is zillowXml variable Inform user that the address form must be submit first
	} else {
		var addPropErrMsg = document.createElement('p');
		addPropErrMsg.innerHTML = "Please submit the Address Form to verify the property";
		addBTN.parentNode.insertBefore(addPropErrMsg, addBTN.nextSibling);
	}
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
	sendRequest();
}

function clearPropAddErr(){
	// Clear out any property list error messages
	var propErrArr = document.querySelectorAll('#propList p')
	for (i=0;i<propErrArr.length;i++){
		propErrArr[i].parentNode.removeChild(propErrArr[i]);
	}	
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





///////////////////////////////////////////////////////////////////////////////
// Build Comps Table Scripts  /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function buildCompsTable(){
	var compsTable = document.querySelector("#compsTable");
	compsTable.innerHTML = " <thead><tr><th>Address</th><th>City</th><th>State</th><th>Zip</th><th>Amount</th></tr></thead><tbody></tbody>";

	var compsBody = document.querySelector("#compsTable tbody");
	var zillowCompsArr = (zillowXml.getElementsByTagName("comp"));
	for (i=0;i<zillowCompsArr.length;i++){
		var row = document.createElement("tr");
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[0].innerHTML,"</td>"); // This will get the value Street from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[1].innerHTML,"</td>"); // This will get the value City from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[2].innerHTML,"</td>"); // This will get the value State from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowCompsArr[i].childNodes[2].childNodes[3].innerHTML,"</td>"); // This will get the value Zip from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",Calculator.toDollarFormat(zillowCompsArr[i].childNodes[3].childNodes[0].innerHTML),"</td>"); // This will get the value Amount from Zillow Comps Xml and convert it to dollar format
		compsBody.appendChild(row);
	}
}
