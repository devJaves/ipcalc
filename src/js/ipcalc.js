
/* Variable names used here are based on the terms used in:
 * http://www.cisco.com/c/en/us/about/press/internet-protocol-journal/back-issues/table-contents-12/ip-addresses.html
 * under the heading "The easy way" */
(function(){

	var messageDiv =document.getElementById("message");
	var outputDiv = document.getElementById("output");
	var inputField = document.getElementById("inputfield");

	var singleOrMultiple = document.getElementById("single_or_multiple").value;

	var multipleInputString = ""
	+ " <div class='description'>WAN IP:</div> "
	+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='onKeydownInput()' /> "

	+ " <div class='description'>LAN IP:</div> "
	+ " <input type='text' id='lan' placeholder='e.g. 101.100.188.16/29' onkeydown='onKeydownInput()'/> ";

	var singleInputString = ""
	+ " <div class='description'>IP Address:</div> "
	+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='onKeydownInput()' /> "

	const CIDR = new RegExp(/^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(30|([1-2][0-9])|[8-9])$/);

	const INVALID_SINGLE_IP = "Please enter a valid IP address.";
	const INVALID_MULTIPLE_IP = "Please enter valid WAN and LAN IP addresses.";

	window["onChangeSingleOrMultiple"] = function() {
		clearAndHideMessage();
		clearAndHideOutput();
		checkSingleOrMultiple();
		displayInputFieldBasedOnSingleOrMultiple();
	}

	function checkSingleOrMultiple() {
		singleOrMultiple = document.getElementById("single_or_multiple").value;
	}

	function clearAndHideMessage() {
		messageDiv.innerHTML = "";
		messageDiv.style.display = "none";
	}

	function clearAndHideOutput() {
		outputDiv.innerHTML = "";
		outputDiv.style.display = "none";
	}

	const SINGLE = "single";
	const MULTIPLE = "multiple";

	function displayInputFieldBasedOnSingleOrMultiple() {
		switch(singleOrMultiple) {
			case "multiple":
				inputField.innerHTML = multipleInputString;
				break;
			case "single":
				inputField.innerHTML = singleInputString;
				break;
		}
	}

	window["onKeydownInput"] = function() {
		if (event.keyCode ==13 )
			validateInputs();
	}

	window["onClickSubmit"] = function() {
		validateInputs();
	}

	var isValidInput;
	var doCalculation;
	var errorMessage;

	function validateInputs() {
		if (singleOrMultiple == SINGLE) 
			prepareForCalculationOfSingle();
		else if (singleOrMultiple == MULTIPLE)
			prepareForCalculationOfMultiple();
		validateInputsAndCalculate();
		blurActiveElement();
	}

	function prepareForCalculationOfSingle() {
		isValidInput = isValidWan();
		doCalculation = calculateSingle();
		errorMessage = INVALID_SINGLE_IP;
	}

	function prepareForCalculationOfMultiple() {
		isValidInput = isValidWan() && isValidLan();
		doCalculation = calculateMultiple();
		errorMessage = INVALID_MULTIPLE_IP;
	}

	function validateInputsAndCalculate() {
		if (isValidInput) {
			clearAndHideMessage();
			doCalculation;
		} else {
			setAndDisplayMessage(errorMessage);
			clearAndHideOutput();
		}
	}

	function blurActiveElement() {
		document.activeElement.blur();
	}

	function isValidWan() {
		var wan = document.getElementById("wan").value;
		return CIDR.test(wan);
	}

	function isValidLan() {
		var lan = document.getElementById("lan").value;
		return CIDR.test(lan);
	}

	function setAndDisplayMessage(message) {
		messageDiv.innerHTML = message;
		messageDiv.style.display = "block";
	}

	function calculateSingle() {

		var outputDiv = document.getElementById("output");
		
		var wan = document.getElementById("wan").value;
		
		var wanIP = wan.split("/")[0]; // splits wan into array of two elements, then get first elements
		var wanMaskBits = wan.split("/")[1];
		var wanOctets = wanIP.split(".");
			
		// subnet calculation for WAN
		var wanNetworkOctets = calculateNetworkAddress(wanOctets, wanMaskBits);
		var wanMaskOctets = calculateSubnetMask(wanMaskBits);
		var wanGatewayOctets = calculateGateway(wanNetworkOctets);
		
		
		// translation to string
		var wanGateway = wanGatewayOctets[0]+"."+wanGatewayOctets[1]+"."+wanGatewayOctets[2]+"."+wanGatewayOctets[3];
		var wanSubnetMask = wanMaskOctets[0]+"."+wanMaskOctets[1]+"."+wanMaskOctets[2]+"."+wanMaskOctets[3];
			
		outputDiv.innerHTML = ""
			+"<b>"
				+"IP Address: "+wan+"<br>"
			+"</b>"
			+"<br>"
			+"Gateway: "+wanGateway+"<br>"
			+"SubnetMask: "+wanSubnetMask+"<br>";

		outputDiv.style.display = "block";

	}

	function calculateMultiple() {

		var outputDiv = document.getElementById("output");
		
		var wan = document.getElementById("wan").value;
		var lan = document.getElementById("lan").value;
		
		var wanIP = wan.split("/")[0]; // splits wan into array of two elements, then get first elements
		var wanMaskBits = wan.split("/")[1];
		var wanOctets = wanIP.split(".");
		
		var lanIP = lan.split("/")[0]; // splits wan into array of two elements, then get first elements
		var lanMaskBits = lan.split("/")[1];
		var lanOctets = lanIP.split(".");
		
		// subnet calculation for WAN
		var wanNetworkOctets = calculateNetworkAddress(wanOctets, wanMaskBits);
		var wanMaskOctets = calculateSubnetMask(wanMaskBits);
		var wanGatewayOctets = calculateGateway(wanNetworkOctets);
		
		// subnet calculation for LAN
		var lanNumOfAddresses 	= calculateNumOfAddresses(lanMaskBits);
		var lanNetworkOctets 	= calculateNetworkAddress(lanOctets, lanMaskBits);
		var lanGatewayOctets 	= calculateGateway(lanNetworkOctets);
		var lanBroadcastOctets	= calculateBroadcastAddress(lanNetworkOctets, lanMaskBits);
		var lanFirstHostOctets 	= calculateFirstHost(lanNetworkOctets);
		var lanLastHostOctets 	= calculateLastHost(lanBroadcastOctets);
		var lanMaskOctets = calculateSubnetMask(lanMaskBits);
		
		// translation to string
		var wanGateway = wanGatewayOctets[0]+"."+wanGatewayOctets[1]+"."+wanGatewayOctets[2]+"."+wanGatewayOctets[3];
		var wanSubnetMask = wanMaskOctets[0]+"."+wanMaskOctets[1]+"."+wanMaskOctets[2]+"."+wanMaskOctets[3];
		
		var lanNetwork 	= lanNetworkOctets[0]+"."+lanNetworkOctets[1]+"."+lanNetworkOctets[2]+"."+lanNetworkOctets[3];
		var lanGateway 	= lanGatewayOctets[0]+"."+lanGatewayOctets[1]+"."+lanGatewayOctets[2]+"."+lanGatewayOctets[3];
		var lanBroadcast 	= lanBroadcastOctets[0]+"."+lanBroadcastOctets[1]+"."+lanBroadcastOctets[2]+"."+lanBroadcastOctets[3];
		var lanFirstHost 	= lanFirstHostOctets[0]+"."+lanFirstHostOctets[1]+"."+lanFirstHostOctets[2]+"."+lanFirstHostOctets[3];
		var lanLastHost 	= lanLastHostOctets[0]+"."+lanLastHostOctets[1]+"."+lanLastHostOctets[2]+"."+lanLastHostOctets[3];
		var lanSubnetMask 	= lanMaskOctets[0]+"."+lanMaskOctets[1]+"."+lanMaskOctets[2]+"."+lanMaskOctets[3];
		
		outputDiv.innerHTML = ""
			+"<b>"
				+"WAN IP: "+wan+"<br>"
				+"LAN IP: "+lan+"<br>"
			+"</b>"
			+"<br>"
			+"WAN Gateway: "+wanGateway+"<br>"
			+"WAN SubnetMask: "+wanSubnetMask+"<br>"
			+"<br>"
			+"No. of static IP: "+lanNumOfAddresses+"<br>"
			+"LAN Network: "+lanNetwork+"<br>"
			+"LAN Gateway: "+lanGateway+"<br>"
			+"LAN Useable: "+lanFirstHost+" - "+lanLastHost+"<br>"
			+"LAN Broadcast: "+lanBroadcast+"<br>"
			+"LAN Subnet Mask: "+lanSubnetMask;

		outputDiv.style.display = "block";

	}

	function calculateSubnetMask(maskBits) {
		var maskOctets = [];
		var workingOctet = Math.floor( maskBits / 8 ); // [0, 1, 2, 3]
		
		var subnetBits = maskBits % 8;
		var workingOctetValue = 256 - Math.pow(2, 8 - subnetBits);
		
		// for each octet before the working octet, set value to 255
		for (var i=0; i<workingOctet; i++) {
			maskOctets[i] = 255;
		}

		/* for each octet after the working octet, set value to 0; 
		* i<5 so that if workingOctet is [3], 
		* there is a [4] to take the workingOctet+1 value */
		for (var i=workingOctet+1; i<5; i++) {
			maskOctets[i] = 0;
		}

		// at the working octet, set value
		maskOctets[workingOctet] = workingOctetValue;

		return maskOctets;
		
	}

	function calculateNetworkAddress(octets, maskBits) {

		var networkOctets = octets;
		
		var workingOctet = Math.floor( maskBits / 8 ); // [0, 1, 2, 3]
		var subnetBits 	= maskBits % 8;
		var numOfJumps 	= Math.pow(2, subnetBits);
		var jumpValue 	= Math.pow(2, 8 - subnetBits);

		/* retrieve value of workingOctet from input,
		* and then replace it with workingOctetValue of Network Address */
		var workingOctetValue = networkOctets[workingOctet];
		workingOctetValue = Math.floor(workingOctetValue / jumpValue) * jumpValue;
		networkOctets[workingOctet] = workingOctetValue;

		/* for each octet after the working octet, set value to 0; 
		* i<5 so that if workingOctet is [3], 
		* there is a [4] to take the workingOctet+1 value */
		for (var i=workingOctet+1; i<5; i++) {
			networkOctets[i] = 0;
		}

		return networkOctets;

	}

	function calculateGateway(networkAddressOctets) {

		var gatewayOctets = networkAddressOctets.slice();
		gatewayOctets[3] = gatewayOctets[3] + 1;
		return gatewayOctets;

	}

	function calculateFirstHost(networkAddressOctets) {

		var firstHostOctets = networkAddressOctets.slice();

		firstHostOctets[3] = firstHostOctets[3] + 2;
		return firstHostOctets;
	}

	function calculateLastHost(broadcastOctets) {

		var lastHostOctets = broadcastOctets.slice();

		lastHostOctets[3] = lastHostOctets[3] - 1;
		return lastHostOctets;

	}

	function calculateBroadcastAddress(networkAddressOctets, maskBits) {

		var broadcastOctets = networkAddressOctets.slice();

		var workingOctet = Math.floor( maskBits / 8 ); // [0, 1, 2, 3]
		var subnetBits 	= maskBits % 8;
		var numOfJumps 	= Math.pow(2, subnetBits);
		var jumpValue 	= Math.pow(2, 8 - subnetBits);

		/* retrieve value of workingOctet from input,
		* and then replace it with workingOctetValue of Network Address */
		var workingOctetValue = broadcastOctets[workingOctet];
		workingOctetValue = workingOctetValue + jumpValue - 1; // +jumpValue gives network address of next subnet
		broadcastOctets[workingOctet] = workingOctetValue;

		/* for each octet after the working octet, set value to 0; 
		* i<5 so that if workingOctet is [3], 
		* there is a [4] to take the workingOctet+1 value */
		for (var i=workingOctet+1; i<5; i++) {
			broadcastOctets[i] = 255;
		}

		return broadcastOctets;

	}

	function calculateNumOfAddresses(maskBits) {
		
		var numOfAddresses = Math.pow(2, 32 - maskBits);
		return numOfAddresses;
		
	}
})();