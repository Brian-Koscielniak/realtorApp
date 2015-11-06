///////////////////////////////////////////////////////////////////////////////
// Tabs Scripts ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var tabList = document.querySelectorAll("#tabSection li");
var tabContent = document.querySelectorAll("#tabSection div");

// Loop through and add the event handler
for (i=0;i<tabList.length;i++){
	tabList[i].addEventListener("click",toggleTab);
}
function toggleTab(e){
// Params is either click event or nothing at all
	// Reset the class names of the tabs / tabs content.
	for (i=0;i<tabList.length;i++){
		tabContent[i].className = "tabHide";
		tabList[i].className = "";
	}

	// param 'e' is assumed to be a 'click' event and will evaluate to true
	if (e){ // In this way a user can invoke the toggle
		tabContent[Number(this.id)-1].className = "tab";
		this.className = "currentTab";

	// If this function is call and no param is passed, then 'e' is false(undefined), and change tab to the first one
	} else { // In this way a feature can invoke the toggle
		tabContent[0].className = "tab";
		tabList[0].className = "currentTab";
	}

	// The loan calculator needs to be cleared when any tab is clicked.
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

// Assign the function to the button
var loanSubmit = document.querySelector("#loanForm input[type=button]");
loanSubmit.addEventListener("click", calcMonthlyPayments, false);

function calcMonthlyPayments(){
	// Set err to false every function call
	var err = false;
	
	// Calling clearCalc to clear out error messages
	clearCalc(true);

	// Look for errors
	for (var i=0; i<userDataArr.length; i++){
		var inputNum = Calculator.strToNum(userDataArr[i].value)
		try { 
			if (userDataArr[i] === interestDataField){
				// "Interest" special case
				if (inputNum < 0.1 || isNaN(inputNum)) {err = true; throw "<-- You must enter a number greater than or equal to .1"}
			} else { 
				if (inputNum <= 0 || isNaN(inputNum)) {err = true; throw "<-- You must enter a positive whole number greater than zero"}
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
		P = Number(this.strToNum(P)); // Explict data type conversion ensures math operations perform correctly
		R = Number(this.strToNum(R));
		T = Number(this.strToNum(T));

		// This is the compound interest formula, JavaScipt style (also converted to dollar format)
		return this.toDollarFormat(P*((1-(1/(1+((R/100)/12))))/((1/(1+((R/100)/12)))-Math.pow((1/(1+((R/100)/12))),(T+1)))));
			// Pro-tip: the caret( ^ ) symbol in JavaScript does NOT mean mathmatical power, use Math object pow method instead
	},
	toDollarFormat : function(n){
		// Round to penny
		n = Math.round(n*100)/100;	
		
		// Oh man, I am so glad that the 'Number' data type has this method...
		return String(n.toLocaleString('en', {style: 'currency', currency: 'USD', minimumFractionDigits: 2}));
	},
	strToNum : function(n){
	/* This function is here, so the user can enter in currency symbols and commas 
	into the loan fields if they's like. The function removes any odd symbols */
		// 's' here represts the string that will be construncted in the for loop
		var s = ""
		
		// This for loop will iterate throught the characters in 'n' with hold user input number
		for (i=0;i<String(n).length;i++){
			// This will check for numbers, period('.') and alphabetic characters, and concat them into 's' variable
			/* We want it to error when any alphabetic characters are added, but not on commas or dollar signs */
			if (/[\d\.a-zA-Z]/.test(String(n)[i])){
				s += n[i];
			}
		}	
		
		// Return the string as a number
		return Number(s);
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
	// Just making sure only the map is in 'map'
	mapCanvas.innerHTML = "";

	// Create the map
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: propertyPosition
	});

	// Set the marker
	var marker = new google.maps.Marker({
		position: propertyPosition,
		map: map,
	});
}




///////////////////////////////////////////////////////////////////////////////
// Zillow Ajax Scripts ////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var zillowXml;
var propertyInput = document.querySelectorAll('#addressForm input[type=text]');
var afs = document.getElementById('afs'); // "Address Form Sumbit" button
// It's important that the click event is passed to the handleSubmit function
afs.addEventListener('click', function(e){handleSubmit(e)}, false);

function handleSubmit(e){
	// Check to see	if there is more than empty or white space inside of inputs
	for(i=0;i<propertyInput.length;i++){
		if(!(/\S/.test(propertyInput[i].value))){
			// The input is set to nothing. We don't want a bunch of spaces
			propertyInput[i].value = "";

			// if the input is empty, break out and don't call zillow
			return false;
		}
	}

	// STOP the form from submitting. 
	/* NOTE: If the preventDefault statement comes before the return statement, the HTML5 required 
	error messages will not display. We WANT the error messages, just not for the form to submit */
	e.preventDefault();
	
	// if all is good, call zillow.
	sendRequest("search");
}

function sendRequest(service){
	// Clear out property error on form submit
	clearPropAddErr();

	// Displaying info messages
	compsTable.innerHTML = "<span class='info'>Getting information please wait...</span>";

	/* This condition is needed. For whatever reason inserting text directly into the section#map element via innerHTML
	right before trying to display the map, was interfering with the Maps api, and it would not display. */
	var mapInfo = document.querySelector("#map span")
	if (mapInfo){
		mapInfo.innerHTML = "Getting information please wait...";
	} else {
		var mapInfo = document.createElement('span'); 
		mapInfo.appendChild(document.createTextNode("Getting information please wait..."));
		mapInfo.setAttribute('class','info');
		mapCanvas.appendChild(mapInfo);
	}

	// toggleTabs default is to switch to the first tab("Map").
	toggleTab();

	// Focus in on the 'Address' input elem
	propertyInput[0].focus();	
	
	// Build a url based on the 'reqest type'; either search or comps, which should be passed as a param to this function
	var zillowUrl = buildCall(service); 

	// Makes the string a sendable url
	var data = encodeURIComponent(zillowUrl);

	// Ajax powers Activate! Notice the ternary based on the param 'service' 
	Ajax.sendRequest('/rest', service=="search" ? handleSearch : handleComps, data);
}

function handleSearch(req){
	// Getting that Zillow back, Mmm mmmm tasty!
	zillowXml = req.responseText;
	zillowXml = textToXML(zillowXml);

	// Check the message code from zillow. '0' seems to be the good code, so if it's not that, error message.
	if (zillowXml.getElementsByTagName('code')[0].innerHTML == "0"){
		// Set up the map 
		propertyPosition.lat = Number(zillowXml.getElementsByTagName('latitude')[0].innerHTML); 
		propertyPosition.lng = Number(zillowXml.getElementsByTagName('longitude')[0].innerHTML);
		mapInit();

		// The autoInput is here because we want to full and propery address data in the input fields. Good for error
		autoInput();

		// When the search comes back it will imediately go to retrieve the comparision data
		sendRequest("comps");
	
	
	} else { // If it's not '0' it must be error! 
		// Displaying error messages
		mapCanvas.innerHTML = "<span class='info'>We are sorry, there is no map information for the address you entered.</span>"
		compsTable.innerHTML = "<span class='info'>We are sorry, there is no comparision information for the address you entered.</span>"

		// toggleTabs default is to switch to the first tab("Map").
		toggleTab();
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
	// TODO This zwsid is visable to the user / client. This may or may not be against Zillow terms of use. Move this to backend, somehow...
	var zwsid = "X1-ZWz1a2t5ohptzf_4pyss";
	if (service === "search"){
		// Get user property input 
		var address = propertyInput[0].value;
		var citystatezip = propertyInput[1].value + "+" + propertyInput[2].value + "+" + propertyInput[3].value;

		// It seems Zillow is smart enough to handle spaces, mixed case characters, and incomplete data. So we'll just give them user input as is
		return "".concat("http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=",zwsid,"&address=",address,"&citystatezip=",citystatezip);

	} else if (service === "comps"){
		return "".concat("http://www.zillow.com/webservice/GetComps.htm?zws-id=",zwsid,"&zpid=",zillowXml.getElementsByTagName('zpid')[0].innerHTML,"&count=25");
	}
}

function textToXML (text) {
// This function is code provided on course website.
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

function autoInput(){
/* This function will extract the address data from zillow xml and fill out the corresponding inputs with that data.
it is important that the input elemenets match, as this will be used as a condtion in 'addProperty' function */
	// Get the property json
	var propertyJSON = makePropertyJSON();

	// Actually place in the values	
	propertyInput[0].value = String(propertyJSON['street']);
	propertyInput[1].value = String(propertyJSON['city']);
	propertyInput[2].value = String(propertyJSON['state']);
	propertyInput[3].value = String(propertyJSON['zipcode']);
}

function makePropertyJSON(){
// This function will extract address information and return it as JSON
	// The property information must be extracted from Zillow XML, and converted to JSON
	var propertyJSON = {
		"street":zillowXml.getElementsByTagName('street')[0].innerHTML,
		"city":zillowXml.getElementsByTagName('city')[0].innerHTML,
		"state":zillowXml.getElementsByTagName('state')[0].innerHTML,
		"zipcode":zillowXml.getElementsByTagName('zipcode')[0].innerHTML
	};
	return propertyJSON;
}

function checkMatching(a){
/* This function takes an object and checks if its values match the address form input */
	// Check each address form input and check to see if it's equivalant to the most resently searched property 
	if(propertyInput[0].value == a['street'] && propertyInput[1].value == a['city'] && propertyInput[2].value == a['state'] && propertyInput[3].value == a['zipcode']){return true;};

	// If they do not match, then false
	return false;
}

function addProperty(){
/* My conditionals got out of hand in this on... But there are many different things a user can do in different orders, so... */
	// Clears out the error messages from the property list
	clearPropAddErr();

	// If there is no xml data, no way can a listing be built.
	if (zillowXml){
		// Zillow WILL return xml if called, but it might not be a valid address. So we check zillow message 'code' and if it is good("0") do this...
		if (zillowXml.getElementsByTagName('code')[0].innerHTML == "0"){
			// Get the property data, make it json
			var propertyJSON = makePropertyJSON();
			
			/* The user may change the address form input values, and try to add those new values. That address must
			be verified with a zillow call. This prevents users from adding, viewing, etc. properties that don't exist */
			if (checkMatching(propertyJSON)){ 
				// This will loop through local web storage
				for(i=0;i<localStorage.length;i++){
					// Add check to see if the property is already listed. 
					if(Number(zillowXml.getElementsByTagName('zpid')[0].innerHTML) == Number(localStorage.key(i))){
						// If the property is already listed, inform the user 
						var addPropErrMsg = document.createElement('p');
						addPropErrMsg.innerHTML = "This Property has already been added to the list";
						addBTN.parentNode.insertBefore(addPropErrMsg, addBTN.nextSibling);

						// And exit the function	
						return;
					}
				}
				// If all is good: This will place that property information into local web storage using the Zillow 'zpid' number as the key.
				localStorage[zillowXml.getElementsByTagName('zpid')[0].innerHTML] = JSON.stringify(propertyJSON);

				buildPropertyList();

			} else {
			// This error should display if the user changed any values in the address input form
				var addPropErrMsg = document.createElement('p');
				addPropErrMsg.innerHTML = "Please submit the Address Form to verify the property";
				addBTN.parentNode.insertBefore(addPropErrMsg, addBTN.nextSibling);

			}
		} else {
		// This should display if the property was not found.
			var addPropErrMsg = document.createElement('p');
			addPropErrMsg.innerHTML = "You can not add a property that was not found";
			addBTN.parentNode.insertBefore(addPropErrMsg, addBTN.nextSibling);
		}
	} else {
	// This should display is the form was not sumbit
		var addPropErrMsg = document.createElement('p');
		addPropErrMsg.innerHTML = "Please submit the Address Form to verify the property";
		addBTN.parentNode.insertBefore(addPropErrMsg, addBTN.nextSibling);
	}

	// Clear the error after a set amount of time, it doesn't need to linger.
	setTimeout(clearPropAddErr, 5000);
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
	propertyInput[0].value = String(property['street']);
	propertyInput[1].value = String(property['city']);
	propertyInput[2].value = String(property['state']);
	propertyInput[3].value = String(property['zipcode']);

	// Re-send Zillow Ajax request
	sendRequest("search");
}

function clearPropAddErr(){
	// Clear out any property list error messages
	var propErrArr = document.querySelectorAll('#propList p')
	for (i=0;i<propErrArr.length;i++){
		propErrArr[i].parentNode.removeChild(propErrArr[i]);
	}	
}

function buildPropertyList(){
	// Duplicates can be prevented, simply by setting the content to nothing and rebuilding all content everytime function is called.
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
var compsTable = document.querySelector("#compsTable");
function buildCompsTable(){
	// Place in the completed thead, and an empty tbody.
	compsTable.innerHTML = " <thead><tr><th>Address</th><th>City</th><th>State</th><th>Zip</th><th>Amount</th></tr></thead><tbody></tbody>";

	// Get that tbody
	var compsBody = document.querySelector("#compsTable tbody");

	// Get zillow comps datt
	var zillowCompsArr = (zillowXml.getElementsByTagName("comp"));

	// Cycle though zillow comps data, and add it to the table
	for (i=0;i<zillowCompsArr.length;i++){
		var row = document.createElement("tr");
		row.innerHTML += "".concat("<td>",zillowXml.querySelectorAll("comp street")[i].innerHTML,"</td>"); // This will get the value Street from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowXml.querySelectorAll("comp city")[i].innerHTML,"</td>"); // This will get the value City from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowXml.querySelectorAll("comp state")[i].innerHTML,"</td>"); // This will get the value State from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",zillowXml.querySelectorAll("comp zipcode")[i].innerHTML,"</td>"); // This will get the value Zip from Zillow Comps Xml
		row.innerHTML += "".concat("<td>",Calculator.toDollarFormat(zillowCompsArr[i].childNodes[3].childNodes[0].innerHTML),"</td>"); // This will get the value Amount from Zillow Comps Xml and convert it to dollar format
		compsBody.appendChild(row);
	}
}
