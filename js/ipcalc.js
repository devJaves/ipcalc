
/* Variable names used here are based on the terms used in:
 * http://www.cisco.com/c/en/us/about/press/internet-protocol-journal/back-issues/table-contents-12/ip-addresses.html
 * under the heading "The easy way" */

function changeInput() {

	/* on change of selection, reset message to blank and hide output div */
	var messageDiv = document.getElementById("message");
	var outputDiv = document.getElementById("output");
	messageDiv.innerHTML = "";
	messageDiv.style.display = "none";
	outputDiv.innerHTML = "";
	outputDiv.style.display = "none";

	/* definition of the field to print in and things to print */
	var inputField = document.getElementById("inputfield");

	var multipleInputString = ""
		+ " <div class='description'>WAN IP:</div> "
		+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='enter()' /> "

		+ " <div class='description'>LAN IP:</div> "
		+ " <input type='text' id='lan' placeholder='e.g. 101.100.188.16/29' onkeydown='enter()'/> ";

	var singleInputString = ""
		+ " <div class='description'>IP Address:</div> "
		+ " <input type='text' id='wan' placeholder='e.g. 103.241.63.22/24' onkeydown='enter()' /> "

	var singleOrMultiple = document.getElementById("single_or_multiple").value;


	/* on change of selection, print relevant input fields */
	switch(singleOrMultiple) {

		case "multiple":
			inputField.innerHTML = multipleInputString;
			break;

		case "single":
			inputField.innerHTML = singleInputString;
			break;

	}

}

function enter() {
	if (event.keyCode ==13 ) {
		validate();
	}
}

function validate() {

	var messageDiv = document.getElementById("message");
	var outputDiv = document.getElementById("output");
	
	var cidrRegex = new RegExp(/^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(30|([1-2][0-9])|[8-9])$/);

	var singleOrMultiple = document.getElementById("single_or_multiple").value;

	switch(singleOrMultiple) {

		case "single":
			var wan = document.getElementById("wan").value;
			var wanValidation = cidrRegex.test(wan);

			// CIDR regex validation
			if (wanValidation) {
				messageDiv.innerHTML = "";
				messageDiv.style.display = "none";
				calculateSingle();
			} else {
				messageDiv.innerHTML = "Please enter a valid IP address.";
				messageDiv.style.display = "block";

				outputDiv.innerHTML = "";
				outputDiv.style.display = "none";
			}
			break;

		case "multiple":
			var wan = document.getElementById("wan").value;
			var wanValidation = cidrRegex.test(wan);

			var lan = document.getElementById("lan").value;
			var lanValidation = cidrRegex.test(lan);
			
			// CIDR regex validation
			if (wanValidation && lanValidation) {
				messageDiv.innerHTML = "";
				messageDiv.style.display = "none";
				calculateMultiple();
			} else {
				messageDiv.innerHTML = "Please enter valid WAN and LAN IP addresses.";
				messageDiv.style.display = "block";

				outputDiv.innerHTML = "";
				outputDiv.style.display = "none";
			}
			break;

	}

	document.activeElement.blur();
	
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