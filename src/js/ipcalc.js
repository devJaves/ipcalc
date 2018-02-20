/* Variable names used here are based on the terms used in:
 * http://www.cisco.com/c/en/us/about/press/internet-protocol-journal/back-issues/table-contents-12/ip-addresses.html
 * under the heading "The easy way" */
(function(){

	var ipInputsDiv = document.getElementById("ip_inputs");
	var outputDiv = document.getElementById("output");
	var errorDiv = document.getElementById("error");

	var modeSingleOrMultiple;

	window["onLoadPage"] = function() {
		getMode();
	}

	window["onChangeSingleOrMultiple"] = function() {
		clearAndHideOutput();
		clearAndHideError();
		getMode();
		displayInputFieldsBasedOnMode();
	}

	function clearAndHideError() {
		errorDiv.innerHTML = "";
		errorDiv.style.display = "none";
	}

	function clearAndHideOutput() {
		outputDiv.innerHTML = "";
		outputDiv.style.display = "none";
	}

	function getMode() {
		modeSingleOrMultiple = document.getElementById("single_or_multiple").value;
	}

	const MODE_SINGLE_STATIC_IP = "single";
	const MODE_MULTIPLE_STATIC_IP = "multiple";

	const INPUT_FIELD_FOR_MULTIPLE = ""
	+ " <div class='description'>WAN IP:</div> "
	+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='onKeydownInput()' /> "

	+ " <div class='description'>LAN IP:</div> "
	+ " <input type='text' id='lan' placeholder='e.g. 101.100.188.16/29' onkeydown='onKeydownInput()'/> ";

	const INPUT_FIELD_FOR_SINGLE = ""
	+ " <div class='description'>IP Address:</div> "
	+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='onKeydownInput()' /> ";
	
	function displayInputFieldsBasedOnMode() {
		if (modeSingleOrMultiple == MODE_SINGLE_STATIC_IP)
			ipInputsDiv.innerHTML = INPUT_FIELD_FOR_SINGLE;

		else if (modeSingleOrMultiple == MODE_MULTIPLE_STATIC_IP)
			ipInputsDiv.innerHTML = INPUT_FIELD_FOR_MULTIPLE;
	}

	window["onKeydownInput"] = function() {
		if (event.keyCode == 13 ) // 13 == enter
			processRequest();
	}

	window["onClickSubmit"] = function() {
		processRequest();
	}

	function processRequest() {
		getWanInput();
		prepareVariablesBasedOnMode();
		validateAndCalculate();
		blurActiveElement();
	}

	var wan;
	var lan;

	function getWanInput() {
		wan = document.getElementById("wan").value;
	}
	function getLanInput() {
		lan = document.getElementById("lan").value;
	}

	function prepareVariablesBasedOnMode() {
		if (modeSingleOrMultiple == MODE_SINGLE_STATIC_IP) 
			prepareSingleIpValidationAndCalculation();
		else if (modeSingleOrMultiple == MODE_MULTIPLE_STATIC_IP)
			prepareMultipleIpValidationAndCalculation();
	}

	const ERROR_SINGLE_IP = "Please enter a valid IP address.";
	const ERROR_MULTIPLE_IP = "Please enter valid WAN and LAN IP addresses.";

	var isValidInput;
	var doCalculation;
	var errorMessage;

	function prepareSingleIpValidationAndCalculation() {
		isValidInput = isValidCidrIp(wan);
		doCalculation = calculateSingle();
		errorMessage = ERROR_SINGLE_IP;
	}

	function prepareMultipleIpValidationAndCalculation() {
		getLanInput();
		isValidInput = isValidCidrIp(wan) && isValidCidrIp(lan);
		doCalculation = calculateMultiple();
		errorMessage = ERROR_MULTIPLE_IP;
	}

	const CIDR = new RegExp(/^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(30|([1-2][0-9])|[8-9])$/);

	function isValidCidrIp(ip) {
		return CIDR.test(ip);
	}

	function validateAndCalculate() {
		if (isValidInput) {
			clearAndHideError();
			doCalculation;
		} else {
			setAndDisplayMessage(errorMessage);
			clearAndHideOutput();
		}
	}

	function setAndDisplayMessage(message) {
		errorDiv.innerHTML = message;
		errorDiv.style.display = "block";
	}

	function blurActiveElement() {
		document.activeElement.blur();
	}

	var outputDiv;

	var wanMaskBits;
	var wanOctets;

	var wanNetworkOctets;
	var wanMaskOctets;
	var wanGatewayOctets;

	var wanGateway;
	var wanSubnetMask;

	function calculateSingle() {
		initOutputDiv();
		splitWanIntoSegments();
		calculateWanSubnet();
		joinWanOutputOctetsIntoString();
		displayOutputForSingle();
	}

	function initOutputDiv() {
		outputDiv = document.getElementById("output");
	}

	function splitWanIntoSegments() {
		var wanIP = wan.split("/")[0];
		wanMaskBits = wan.split("/")[1];
		wanOctets = wanIP.split(".");
	}

	var lanMaskBits;
	var lanOctets;

	function splitLanIntoSegments() {
		var lanIP = lan.split("/")[0];
		lanMaskBits = lan.split("/")[1];
		lanOctets = lanIP.split(".");
	}

	function calculateWanSubnet() {
		wanNetworkOctets = calculateNetworkAddress(wanOctets, wanMaskBits);
		wanMaskOctets = calculateSubnetMask(wanMaskBits);
		wanGatewayOctets = calculateGateway(wanNetworkOctets);
	}

	function joinWanOutputOctetsIntoString() {
		wanGateway = wanGatewayOctets[0]+"."+wanGatewayOctets[1]+"."+wanGatewayOctets[2]+"."+wanGatewayOctets[3];
		wanSubnetMask = wanMaskOctets[0]+"."+wanMaskOctets[1]+"."+wanMaskOctets[2]+"."+wanMaskOctets[3];
	}

	function displayOutputForSingle() {
		outputDiv.innerHTML = ""
		+"<b>"
			+"IP Address: "+wan+"<br>"
		+"</b>"
		+"<br>"
		+"Gateway: "+wanGateway+"<br>"
		+"SubnetMask: "+wanSubnetMask+"<br>";

		outputDiv.style.display = "block";
	}

	var lanNumOfAddresses;
	var lanNetworkOctets;
	var lanGatewayOctets;
	var lanBroadcastOctets;
	var lanFirstHostOctets;
	var lanLastHostOctets;
	var lanMaskOctets;

	function calculateMultiple() {
		initOutputDiv();
		getWanInput();
		getLanInput();
		splitWanIntoSegments();
		splitLanIntoSegments();
		calculateWanSubnet();
		calculateLanSubnet();
		joinWanOutputOctetsIntoString();
		joinLanOutputOctetsIntoString();
		displayOutputForMultiple();
	}

	function calculateLanSubnet() {
		lanNumOfAddresses 	= calculateNumOfAddresses(lanMaskBits);
		lanNetworkOctets 	= calculateNetworkAddress(lanOctets, lanMaskBits);
		lanGatewayOctets 	= calculateGateway(lanNetworkOctets);
		lanBroadcastOctets	= calculateBroadcastAddress(lanNetworkOctets, lanMaskBits);
		lanFirstHostOctets 	= calculateFirstHost(lanNetworkOctets);
		lanLastHostOctets 	= calculateLastHost(lanBroadcastOctets);
		lanMaskOctets = calculateSubnetMask(lanMaskBits);
	}

	var lanNetwork;
	var lanGateway;
	var lanBroadcast;
	var lanFirstHost;
	var lanLastHost;
	var lanSubnetMask;

	function joinLanOutputOctetsIntoString() {
		lanNetwork 	= lanNetworkOctets[0]+"."+lanNetworkOctets[1]+"."+lanNetworkOctets[2]+"."+lanNetworkOctets[3];
		lanGateway 	= lanGatewayOctets[0]+"."+lanGatewayOctets[1]+"."+lanGatewayOctets[2]+"."+lanGatewayOctets[3];
		lanBroadcast 	= lanBroadcastOctets[0]+"."+lanBroadcastOctets[1]+"."+lanBroadcastOctets[2]+"."+lanBroadcastOctets[3];
		lanFirstHost 	= lanFirstHostOctets[0]+"."+lanFirstHostOctets[1]+"."+lanFirstHostOctets[2]+"."+lanFirstHostOctets[3];
		lanLastHost 	= lanLastHostOctets[0]+"."+lanLastHostOctets[1]+"."+lanLastHostOctets[2]+"."+lanLastHostOctets[3];
		lanSubnetMask 	= lanMaskOctets[0]+"."+lanMaskOctets[1]+"."+lanMaskOctets[2]+"."+lanMaskOctets[3];
	}

	function displayOutputForMultiple() {
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