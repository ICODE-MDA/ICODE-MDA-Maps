/**
 * @name vesselDetails.js
 * @author Julie Luu
 * @fileoverview
 * Script to handle retrieval and display of detailed vessel information
 */
 
 // global variables
 var imo = "";
 
// trigger click event to search when 'Enter' key pressed in search bar
$(document).keypress(function(e) {
	if (e.which == 13) {
		// print what you are searching for in document
		searchResults();
	}
});

 // check for previous IMO Number
 function checkImo(){
	if(!imo){
		$(".mainPanel").html(
			'<div class="title">Notice</div>' +
			'<div style="color:red;font-weight:bold;">Vessel was not specified. Click on a vessel in the Maps widget or use the search bar.</div>'
		);
		return true;
	}
 }
 
 // Show search results
function searchResults() {
	var searchType = $('#searchType').find(":selected").val();
	var searchTerm = $('#searchTerm').val();
	
	// check to ensure user entered valid info in search box
	if (searchTerm == "") {
		$(".mainPanel").html(
			'<div class="title">Notice</div>' +
			'<div style="color:red;font-weight:bold;">A valid search term must be entered.</div>'
		);
		return;
	}
	if (searchType == "selectImo") {
		if ((!($.isNumeric(searchTerm)))||(searchTerm.length != 7)) {
			$(".mainPanel").html(
				'<div class="title">Notice</div>' +
				'<div style="color:red;font-weight:bold;">Invalid IMO Number entered.</div>'
			);
			return;
		}
	} else if (searchType == "selectMmsi") {
		if ((!($.isNumeric(searchTerm)))||(searchTerm.length != 9)) {
			$(".mainPanel").html(
				'<div class="title">Notice</div>' +
				'<div style="color:red;font-weight:bold;">Invalid MMSI entered.</div>'
			);
			return;
		}
	}
	
	initialize(true,searchType,searchTerm);
}

// Get information from database and show Initial info in main panel
// parameters: (1) bool; launched by widget or manually,
// (2) string; search by? imo, mmsi, or vessel name
// (3) string; search for?
 function initialize(launchData,searchType,searchTerm) {

	// check how widget was launched
	if (!launchData) {
		// manual launch: display notice to user
		$("#detailShipName").html("N/A");
		$("#detailImo").html("N/A");
		$("#detailCallSign").html("N/A");
		$("#detailMmsi").html("N/A");
		$("#detailFlag").html("N/A");
		$("#detailOperator").html("N/A");
		$("#detailShiptype").html("N/A");
		$("#detailGross").html("N/A");
		$("#detailDeadweight").html("N/A");
		$("#detailDateOfBuild").html("N/A");
		$("#detailShipStatus").html("N/A");
		$("#detailShipbuilder").html("N/A");
		
		$(".mainPanel").html(
			'<div class="title">Notice</div>' +
			'<div style="color:red;font-weight:bold;">Widget was launched manually. Please input a vessel in search bar or click on a ship in the Maps widget to see vessel details.</div>'
		);
	} else {
		// launched via maps widget: retrieve info for vessel using IMO and display in main panel
		var phpWithArg = "query_vessel_details.php?source=initialize&searchType=" + searchType + "&searchTerm=" + searchTerm;
		console.log('phpWithArg: ' + phpWithArg);
	
		// retrieve info from database using query request parameters
		$.getJSON(
			phpWithArg, // server URL
			function () { 
			}
		).done(function (response) {
			console.log('Vessels Detail: ' + response.query);		
			if (response.resultcount == 1) {
				// exactly one vessel retrieved; display that vessel
				for(var i=0; i<response.vesseldata.length; i++) {
					var shipName = response.vesseldata[0].shipName;
					var dimo = response.vesseldata[0].imo;
					var callSign = response.vesseldata[0].callSign;
					var mmsi = response.vesseldata[0].mmsi;
					var flag = response.vesseldata[0].flag;
					var operator = response.vesseldata[0].operator;
					var shipType = response.vesseldata[0].shipType;
					var shipSubtype = response.vesseldata[0].shipSubtype;
					var gross = response.vesseldata[0].gross;
					var deadweight = response.vesseldata[0].deadweight;
					var dateOfBuild = ((response.vesseldata[0].dateOfBuild).split(" "))[0];
					var shipStatus = response.vesseldata[0].shipStatus;
					var shipSubstatus = response.vesseldata[0].shipSubstatus;
					var shipBuilder = response.vesseldata[0].shipBuilder;
					
					shipName = checkNullField(shipName);
					dimo = checkNullField(dimo);
					callSign = checkNullField(callSign);
					mmsi = checkNullField(mmsi);
					flag = checkNullField(flag);
					operator = checkNullField(operator);
					shipType= checkNullField(shipType);
					shipSubtype = checkNullField(shipSubtype);
					gross = checkNullField(gross);
					deadweight = checkNullField(deadweight);
					dateOfBuild = checkNullField(dateOfBuild);
					shipStatus = checkNullField(shipStatus);
					shipSubstatus = checkNullField(shipSubstatus);
					shipBuilder = checkNullField(shipBuilder);
				}
				imo = dimo;
				$(".mainPanel").html('');
				$("#detailShipName").html(shipName);
				$("#detailImo").html(dimo);
				$("#detailCallSign").html(callSign);
				$("#detailMmsi").html(mmsi);
				$("#detailFlag").html(flag);
				$("#detailOperator").html(operator);
				$("#detailShiptype").html(shipType + ": " + shipSubtype);
				$("#detailGross").html(gross);
				$("#detailDeadweight").html(deadweight);
				$("#detailDateOfBuild").html(dateOfBuild);
				$("#detailShipStatus").html(shipSubstatus);
				$("#detailShipbuilder").html(shipBuilder);
				
			} else if(response.resultcount > 1) {
				// more than one vessel retrieved; display list with links
				$(".mainPanel").html(
					'<div class="title">Search Results</div>' +
					'<div style="color:red;font-weight:bold;">Found ' +
					response.resultcount + 
					' results.</div><div>&nbsp;</div>'
				);
				for(var i=0; i<response.vesseldata.length; i++) {
					var shipName = response.vesseldata[i].shipName;
					var dimo = response.vesseldata[i].imo;
					var callSign = response.vesseldata[i].callSign;
					var mmsi = response.vesseldata[i].mmsi;
					var flag = response.vesseldata[i].flag;
					var operator = response.vesseldata[i].operator;
					var shipType = response.vesseldata[i].shipType;
					var shipSubtype = response.vesseldata[i].shipSubtype;
					var gross = response.vesseldata[i].gross;
					var deadweight = response.vesseldata[i].deadweight;
					var dateOfBuild = ((response.vesseldata[i].dateOfBuild).split(" "))[0];
					var shipStatus = response.vesseldata[i].shipStatus;
					var shipSubstatus = response.vesseldata[i].shipSubstatus;
					var shipBuilder = response.vesseldata[i].shipBuilder;
					var num = i+1;
					var str = "'selectImo'";
					$(".mainPanel").append(
					'<div class="fourColsContainer">' +
						'<button style="border: 0;" onclick="initialize(true,' + str + ',' + dimo + ');">' + 
							num + ' |  Name: ' + shipName + ' | IMO No: ' + dimo + ' | MMSI: ' + mmsi + ' | Call Sign: ' + callSign + ' | Flag: ' + flag + 
						'</button>' +
					'</div>'
					);
				}
			} else {
				// no vessel retrieved
				$(".mainPanel").html(
					'<div class="title">Notice</div>' +
					'<div style="color:red;font-weight:bold;">Unable to find vessel in database.</div>'
				);
			}				
		}).fail(function() {
			console.log('Vessels Detail: No response from database; error in php?');
			return;
		});
	}
}

// Get information from database and show Registration info in main panel
function triggerRegistration() {
	if(checkImo()){return;};
	
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=registration&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").html(
				'<div class="title">Registration</div>' +
				'<div class="subtitle">Registration, P&I, and Communications</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Port of Registry</div>' +
						'<div class="fourColsLabel">Official Number</div>' +
						'<div class="fourColsLabel">Sat Com Ans Back</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="regPortOfRegistry"></div>' +
						'<div id="regOfficialNumber"></div>' +
						'<div id="regSatComAnsBack"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Flag</div>' +
						'<div class="fourColsLabel">Sat Com ID</div>' +
						'<div class="fourColsLabel">Fishing Number</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="regFlag"></div>' +
						'<div id="regSatComId"></div>' +
						'<div id="regFishingNumber"></div>' +
						'</div>' +
					'</div>' +
				'</div> ' +
				
				'<div>&nbsp;</div>' +
				
				'<div class="subtitle">P&I Club History</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">P&I Club ID</div>' +
						'<div class="fourColsLabel">P&I Club Status</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="regPandiClubId"></div>' +
						'<div id="regPandiClub"></div>' +
					'</div>' +
				'</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].regPortOfRegistry = checkNullField(response.vesseldata[0].regPortOfRegistry);
			response.vesseldata[0].regOfficialNumber = checkNullField(response.vesseldata[0].regOfficialNumber);
			response.vesseldata[0].regFishingNumber = checkNullField(response.vesseldata[0].regFishingNumber);
			response.vesseldata[0].regSatComAnsbkCode = checkNullField(response.vesseldata[0].regSatComAnsbkCode);
			response.vesseldata[0].regFlag = checkNullField(response.vesseldata[0].regFlag);
			response.vesseldata[0].regSatCom = checkNullField(response.vesseldata[0].regSatCom);
			response.vesseldata[0].regPandiId = checkNullField(response.vesseldata[0].regPandiId);
			response.vesseldata[0].regPandiClub = checkNullField(response.vesseldata[0].regPandiClub);

			// display data
			$("#regPortOfRegistry").html(response.vesseldata[0].regPortOfRegistry);
			$("#regOfficialNumber").html(response.vesseldata[0].regOfficialNumber);
			$("#regSatComAnsBack").html(response.vesseldata[0].regSatComAnsbkCode);
			$("#regSatComId").html(response.vesseldata[0].regSatCom);
			$("#regFlag").html(response.vesseldata[0].regFlag);
			$("#regFishingNumber").html(response.vesseldata[0].regFishingNumber);
			$("#regPandiClubId").html(response.vesseldata[0].regPandiId);
			$("#regPandiClub").html(response.vesseldata[0].regPandiClub);
		} else {
			$(".mainPanel").html(
			'<div class="title">Registration</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Ownership info in main panel
function createOwnTitle() {
	$(".mainPanel").html(
		'<div class="title">Ownership</div>'
	);
}
function triggerOwnCurrent() {
	createOwnTitle();
	triggerOwnCurrent2();
}
function triggerOwnCurrent2() {
	if(checkImo()){return;};

	var phpWithArg = "query_vessel_details.php?source=ownCurrent&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Current Ownership</div>' +
				'<div class="twoColsContainer">' +
					'<div class="twoColsInner">' +
						'<div class="fourColsLabel">Group Owner</div>' +
						'<div class="fourColsLabel">Ship Manager</div>' +
						'<div class="fourColsLabel">Operator</div>' +
						'<div class="fourColsLabel">Registered Owner</div>' +
						'<div class="fourColsLabel">Technical Manager</div>' +
					'</div>' +
					'<div class="twoColsOuter">' +
						'<div id="ownGroupOwner"></div>' +
						'<div id="ownShipManager"></div>' +
						'<div id="ownOperator"></div>' +
						'<div id="ownRegisteredOwner"></div>' +
						'<div id="ownTechnicalManager"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
			
			// format data; remove NULL strings
			response.vesseldata[0].ownOwner = checkNullField(response.vesseldata[0].ownOwner);
			response.vesseldata[0].ownOwnerId = checkNullField(response.vesseldata[0].ownOwnerId);
			response.vesseldata[0].ownOwnerCod = checkNullField(response.vesseldata[0].ownOwnerCod);
			response.vesseldata[0].ownManager = checkNullField(response.vesseldata[0].ownManager);
			response.vesseldata[0].ownManagerId = checkNullField(response.vesseldata[0].ownManagerId);
			response.vesseldata[0].ownManagerCod = checkNullField(response.vesseldata[0].ownManagerCod);
			response.vesseldata[0].ownOperator = checkNullField(response.vesseldata[0].ownOperator);
			response.vesseldata[0].ownOperatorId = checkNullField(response.vesseldata[0].ownOperatorId);
			response.vesseldata[0].ownOperatorCod = checkNullField(response.vesseldata[0].ownOperatorCod);
			response.vesseldata[0].ownRegisteredOwner = checkNullField(response.vesseldata[0].ownRegisteredOwner);
			response.vesseldata[0].ownRegisteredOwnerId = checkNullField(response.vesseldata[0].ownRegisteredOwnerId);
			response.vesseldata[0].ownRegisteredOwnerCod = checkNullField(response.vesseldata[0].ownRegisteredOwnerCod);
			response.vesseldata[0].ownTechnicalManager = checkNullField(response.vesseldata[0].ownTechnicalManager);
			response.vesseldata[0].ownTechnicalManagerCod = checkNullField(response.vesseldata[0].ownTechnicalManagerCod);
			
			// display data
			$("#ownGroupOwner").html(
				"ID: " + 
				response.vesseldata[0].ownOwnerId + ", " +
				response.vesseldata[0].ownOwner + ", " + 
				response.vesseldata[0].ownOwnerCod
			);
			$("#ownShipManager").html(
				"ID: " +
				response.vesseldata[0].ownManagerId + ", " +
				response.vesseldata[0].ownManager + ", " +				
				response.vesseldata[0].ownManagerCod
			);
			$("#ownOperator").html(
				"ID: " +
				response.vesseldata[0].ownOperatorId + ", " +
				response.vesseldata[0].ownOperator + ", " +				
				response.vesseldata[0].ownOperatorCod
			);
			$("#ownRegisteredOwner").html(
				"ID: " +
				response.vesseldata[0].ownRegisteredOwnerId + ", " +
				response.vesseldata[0].ownRegisteredOwner + ", " +				
				response.vesseldata[0].ownRegisteredOwnerCod
			);
			$("#ownTechnicalManager").html(
				response.vesseldata[0].ownTechnicalManager + ", " +				
				response.vesseldata[0].ownTechnicalManagerCod
			);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Current Ownership</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerOwnOriginal() {
	createOwnTitle();
	triggerOwnOriginal2();
}
function triggerOwnOriginal2() {
	if(checkImo()){return;};
	
	var phpWithArg = "query_vessel_details.php?source=ownOriginal&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Original Ownership</div>' +
				'<div class="twoColsContainer">' +
					'<div class="twoColsInner">' +
						'<div class="fourColsLabel">Original Vessel Name</div>' +
						'<div class="fourColsLabel">Original Flag</div>' +
						'<div class="fourColsLabel">Original Owner</div>' +
						'<div class="fourColsLabel">Original Manager</div>' +
						'<div class="fourColsLabel">Original Operator</div>' +				
					'</div>' +
					'<div class="twoColsOuter">' +
						'<div id="ownOrigVesselName"></div>' +
						'<div id="ownOrigFlag"></div>' +
						'<div id="ownOrigOwner"></div>' +
						'<div id="ownOrigManager"></div>' +
						'<div id="ownOrigOperator"></div>' +			
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].ownOrigOwner = checkNullField(response.vesseldata[0].ownOrigOwner);
			response.vesseldata[0].ownOrigOwnerCod = checkNullField(response.vesseldata[0].ownOrigOwnerCod);
			response.vesseldata[0].ownOrigManager = checkNullField(response.vesseldata[0].ownOrigManager);
			response.vesseldata[0].ownOrigManagerCod = checkNullField(response.vesseldata[0].ownOrigManagerCod);
			response.vesseldata[0].ownOrigOperator = checkNullField(response.vesseldata[0].ownOrigOperator);
			response.vesseldata[0].ownOrigOperatorCod = checkNullField(response.vesseldata[0].ownOrigOperatorCod);
			response.vesseldata[0].ownOrigVesselName = checkNullField(response.vesseldata[0].ownOrigVesselName);
			response.vesseldata[0].ownOrigFlag = checkNullField(response.vesseldata[0].ownOrigFlag);
			
			// display data
			$("#ownOrigOwner").html(
				response.vesseldata[0].ownOrigOwner + ", " + 
				response.vesseldata[0].ownOrigOwnerCod
			);
			$("#ownOrigManager").html(
				response.vesseldata[0].ownOrigManager + ", " +				
				response.vesseldata[0].ownOrigManagerCod
			);
			$("#ownOrigOperator").html(
				response.vesseldata[0].ownOrigOperator + ", " +				
				response.vesseldata[0].ownOrigOperatorCod
			);
			$("#ownOrigVesselName").html(response.vesseldata[0].ownOrigVesselName);
			$("#ownOrigFlag").html(response.vesseldata[0].ownOrigFlag);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Original Ownership</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerOwnViewAll() {
	createOwnTitle();
	triggerOwnCurrent2();
	triggerOwnOriginal2();
}

// Get information from database and show Commercial History info in main panel
function triggerCommercialHistory() {
	if(checkImo()){return;};
	
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=commercialHistory&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").html(
				'<div class="title">Commercial History</div>' +
				'<div class="subtitle">Commercial History</div>' +
				'<div class="twoColsContainer">' +
					'<div class="twoColsInner">' +
						'<div class="fourColsLabel">PCNT</div>' +
						'<div class="fourColsLabel">SCNT</div>' +
					'</div>' +
					'<div class="twoColsOuter">' +
						'<div id="comPcnt"></div>' +
						'<div id="comScnt"></div>' +		
					'</div>' +
				'</div>'
			);	
			
			// format data; remove NULL strings
			response.vesseldata[0].comPcnt = checkNullField(response.vesseldata[0].comPcnt);
			response.vesseldata[0].comScnt = checkNullField(response.vesseldata[0].comScnt);
		
			// display data
			$("#comRoute").html(response.vesseldata[0].comRoute);
			$("#comPcnt").html(response.vesseldata[0].comPcnt);
			$("#comScnt").html(response.vesseldata[0].comScnt);
		} else {
			$(".mainPanel").html(
			'<div class="title">Commercial History</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Class info in main panel
function triggerClass() {
	if(checkImo()){
		return;
	};

	var phpWithArg = "query_vessel_details.php?source=class&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").html(
				'<div class="title">Class</div>' +
				'<div class="subtitle">Class</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Class</div>' +
						'<div class="fourColsLabel">Class ID</div>' +
						'<div class="fourColsLabel">Class Date</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="claClass"></div>' +
						'<div id="claId"></div>' +
						'<div id="claDate"></div>' +
					'</div>' + 
				'</div>'
			);
	
			// format data; remove NULL strings
			if(!response.vesseldata[0].claClass){
				response.vesseldata[0].claClass = "N/A";
			}
			if(response.vesseldata[0].claClass2){
				response.vesseldata[0].claClass2 = ", " + response.vesseldata[0].claClass2;
			}
			if(!response.vesseldata[0].claDate){
				response.vesseldata[0].claDate = "N/A";
			}
			if(!response.vesseldata[0].claId){
				response.vesseldata[0].claId = "N/A";
			}
			
			// display data
			$("#claClass").html(response.vesseldata[0].claClass + response.vesseldata[0].claClass2);
			$("#claId").html(response.vesseldata[0].claId);
			$("#claDate").html(((response.vesseldata[0].claDate).split(" "))[0]);
		} else {
			$(".mainPanel").html(
			'<div class="title">Class</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Survey info in main panel
function triggerSurveys() {
	if(checkImo()){return;};

	var phpWithArg = "query_vessel_details.php?source=surveys&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);

		if (response.resultcount > 0) {
			//build HTML code
			$(".mainPanel").html(
				'<div class="title">Surveys</div>' +
				'<div class="subtitle">Surveys</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Special Survey</div>' +
						'<div class="fourColsLabel">Special Survey Lakes</div>' +
						'<div class="fourColsLabel">Continuous Hull Survey</div>' +
						'<div class="fourColsLabel">Continuous Machinery Survey</div>' +
						'<div class="fourColsLabel">Tail Shaft Survey</div>' +
						'<div class="fourColsLabel">Docking Survey</div>' +
						'<div class="fourColsLabel">Annual Survey</div>' +
						'<div class="fourColsLabel">Class Society</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="surSpecial"></div>' +
						'<div id="surLakes"></div>' +
						'<div id="surHull"></div>' +
						'<div id="surMachinery"></div>' +
						'<div id="surTailShaft"></div>' +
						'<div id="surDocking"></div>' +
						'<div id="surAnnual"></div>' +
						'<div id="surClassSociety"></div>' +
					'</div>' + 
				'</div>'
			);
			
			// format data; remove NULL strings
			response.vesseldata[0].surSpecial = checkNullField(response.vesseldata[0].surSpecial);
			response.vesseldata[0].surLakes = checkNullField(response.vesseldata[0].surLakes);
			response.vesseldata[0].surHull = checkNullField(response.vesseldata[0].surHull);
			response.vesseldata[0].surMachinery = checkNullField(response.vesseldata[0].surMachinery);
			response.vesseldata[0].surTailShaft = checkNullField(response.vesseldata[0].surTailShaft);
			response.vesseldata[0].surDocking = checkNullField(response.vesseldata[0].surDocking);
			response.vesseldata[0].surAnnual = checkNullField(response.vesseldata[0].surAnnual);
			response.vesseldata[0].surClassSociety = checkNullField(response.vesseldata[0].surClassSociety);
				
			// display data
			$("#surSpecial").html(((response.vesseldata[0].surSpecial).split(" "))[0]);
			$("#surLakes").html(((response.vesseldata[0].surLakes).split(" "))[0]);
			$("#surHull").html(((response.vesseldata[0].surHull).split(" "))[0]);
			$("#surMachinery").html(((response.vesseldata[0].surMachinery).split(" "))[0]);
			$("#surTailShaft").html(((response.vesseldata[0].surTailShaft).split(" "))[0]);
			$("#surDocking").html(((response.vesseldata[0].surDocking).split(" "))[0]);
			$("#surAnnual").html(((response.vesseldata[0].surAnnual).split(" "))[0]);
			$("#surClassSociety").html(((response.vesseldata[0].surClassSociety).split(" "))[0]);
		} else {
			$(".mainPanel").html(
			'<div class="title">Surveys</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Construction info in main panel
function createConstructionTitle() {
	$(".mainPanel").html(
		'<div class="title">Construction</div>'		
	);
}
function triggerConOverview() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConOverview2();
}
function triggerConOverview2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conOverview&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Overview</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Ship Type</div>' +
						'<div class="fourColsLabel">Build Date</div>' +
						'<div class="fourColsLabel">Gross Tonnage (GT)</div>' +
						'<div class="fourColsLabel">Deadweight</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conOverviewShiptype"></div>' +
						'<div id="conOverviewLaunched"></div>' +
						'<div id="conOverviewGT"></div>' +
						'<div id="conOverviewDWT"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].conOverviewShiptype = checkNullField(response.vesseldata[0].conOverviewShiptype);
			response.vesseldata[0].conOverviewLaunched = checkNullField(response.vesseldata[0].conOverviewLaunched);
			response.vesseldata[0].conOverviewGT = checkNullField(response.vesseldata[0].conOverviewGT);
			response.vesseldata[0].conOverviewDWT = checkNullField(response.vesseldata[0].conOverviewDWT);
		
			// display data
			$("#conOverviewShiptype").html(response.vesseldata[0].conOverviewShiptype);
			$("#conOverviewLaunched").html(((response.vesseldata[0].conOverviewLaunched).split(" "))[0]);
			$("#conOverviewGT").html(response.vesseldata[0].conOverviewGT);
			$("#conOverviewDWT").html(response.vesseldata[0].conOverviewDWT);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Overview</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerConShipbuilder() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConShipbuilder2();
}
function triggerConShipbuilder2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conShipbuilder&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);	
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
			'<div class="subtitle">Shipbuilder</div>' +
			'<div class="fourColsContainer">' +
				'<div class="fourColsInner">' +
					'<div class="fourColsLabel">Hull Number</div>' +
					'<div class="fourColsLabel">Hull Type</div>' +
					'<div class="fourColsLabel">Shipyard</div>' +
					'<div class="fourColsLabel">Shipyard Hull Number</div>' +
					'<div class="fourColsLabel">Shipyard Location</div>' +
					'<div class="fourColsLabel">Builder</div>' +
					'<div class="fourColsLabel">Builder ID</div>' +
					'<div class="fourColsLabel">Builder Location</div>' +
					'<div class="fourColsLabel">Main HC</div>' +
					
				'</div>' +
				'<div class="fourColsOuter">' +
					'<div id="conHullNo"></div>' +
					'<div id="conHullType"></div>' +
					'<div id="conShipyard"></div>' +
					'<div id="conShipyardHullNo"></div>' +
					'<div id="conShipyardCountry"></div>' +
					'<div id="conBuilder"></div>' +
					'<div id="conBuilderId"></div>' +	
					'<div id="conBuilderCod"></div>' +
					'<div id="conMainHc"></div>' +
				'</div>' +
				'<div class="fourColsInner">' +
					'<div class="fourColsLabel">Main HC Location</div>' +
					'<div class="fourColsLabel">Main HC ID</div>' +
					'<div class="fourColsLabel">Main HC Hull Number</div>' +
					'<div class="fourColsLabel">Main NBC</div>' +
					'<div class="fourColsLabel">Main NBC Location</div>' +
					'<div class="fourColsLabel">Main NBC ID</div>' +
					'<div class="fourColsLabel">Main NBC Hull Number</div>' +
					'<div class="fourColsLabel">Newbuild Price</div>' +
					'<div class="fourColsLabel">Newbuild Price (USD)</div>' +
				'</div>' +
				'<div class="fourColsOuter">' +
					'<div id="conMainHcCod"></div>' +
					'<div id="conMainHcId"></div>' +
					'<div id="conMainHcHullNo"></div>' +
					'<div id="conMainNbc"></div>' +
					'<div id="conMainNbcCod"></div>' +
					'<div id="conMainNbcId"></div>' +
					'<div id="conMainNbcHullNo"></div>' +
					'<div id="conNbcPrice"></div>' +
					'<div id="conNbcPriceUsd"></div>' +
				'</div>' +
			'</div>' +
			'<div>&nbsp;</div>'
			);	
	
			// format data; remove NULL strings
			response.vesseldata[0].conHullNo = checkNullField(response.vesseldata[0].conHullNo);
			response.vesseldata[0].conHullType = checkNullField(response.vesseldata[0].conHullType);
			response.vesseldata[0].conMainHcCod = checkNullField(response.vesseldata[0].conMainHcCod);
			response.vesseldata[0].conMainHcHullNo = checkNullField(response.vesseldata[0].conMainHcHullNo);
			response.vesseldata[0].conShipyardHullNo = checkNullField(response.vesseldata[0].conShipyardHullNo);
			response.vesseldata[0].conBuilderId = checkNullField(response.vesseldata[0].conBuilderId);
			response.vesseldata[0].conMainHcId = checkNullField(response.vesseldata[0].conMainHcId);
			response.vesseldata[0].conMainNbcId = checkNullField(response.vesseldata[0].conMainNbcId);
			response.vesseldata[0].conMainNbcCod = checkNullField(response.vesseldata[0].conMainNbcCod);
			response.vesseldata[0].conMainNbcHullNo = checkNullField(response.vesseldata[0].conMainNbcHullNo);
			response.vesseldata[0].conNbcPrice = checkNullField(response.vesseldata[0].conNbcPrice);
			response.vesseldata[0].conNbcPriceUsd = checkNullField(response.vesseldata[0].conNbcPriceUsd);
			response.vesseldata[0].conBuilderCod = checkNullField(response.vesseldata[0].conBuilderCod);
			response.vesseldata[0].conBuilder = checkNullField(response.vesseldata[0].conBuilder);
			response.vesseldata[0].conMainHc = checkNullField(response.vesseldata[0].conMainHc);
			response.vesseldata[0].conMainNbc = checkNullField(response.vesseldata[0].conMainNbc);
			response.vesseldata[0].conShipyard = checkNullField(response.vesseldata[0].conShipyard);
			response.vesseldata[0].conShipyardCountry = checkNullField(response.vesseldata[0].conShipyardCountry);
			
			// display data
			$("#conHullNo").html(response.vesseldata[0].conHullNo);
			$("#conHullType").html(response.vesseldata[0].conHullType);
			$("#conMainHcCod").html(response.vesseldata[0].conMainHcCod);
			$("#conMainHcHullNo").html(response.vesseldata[0].conMainHcHullNo);
			$("#conShipyardHullNo").html(response.vesseldata[0].conShipyardHullNo);
			$("#conBuilderId").html(response.vesseldata[0].conBuilderId);
			$("#conMainHcId").html(response.vesseldata[0].conMainHcId);
			$("#conMainNbcId").html(response.vesseldata[0].conMainNbcId);
			$("#conMainNbcCod").html(response.vesseldata[0].conMainNbcCod);
			$("#conMainNbcHullNo").html(response.vesseldata[0].conMainNbcHullNo);
			$("#conNbcPrice").html(response.vesseldata[0].conNbcPrice);
			$("#conNbcPriceUsd").html(response.vesseldata[0].conNbcPriceUsd);
			$("#conBuilderCod").html(response.vesseldata[0].conBuilderCod);
			$("#conBuilder").html(response.vesseldata[0].conBuilder);
			$("#conMainHc").html(response.vesseldata[0].conMainHc);
			$("#conMainNbc").html(response.vesseldata[0].conMainNbc);
			$("#conShipyard").html(response.vesseldata[0].conShipyard);
			$("#conShipyardCountry").html(response.vesseldata[0].conShipyardCountry);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Shipbuilder</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerConStatus() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConStatus2();
}
function triggerConStatus2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conStatus&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Status</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Status</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conStatus"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);	
	
			// format data; remove NULL strings
			response.vesseldata[0].conStatus = checkNullField(response.vesseldata[0].conStatus);
		
			// display data
			$("#conStatus").html(response.vesseldata[0].conStatus);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Status</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}	
function triggerConConstructionDetail() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConConstructionDetail2();
}
function triggerConConstructionDetail2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conDetail&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Construction Detail</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Statcode5</div>' +
						'<div class="fourColsLabel">Ship Type Group</div>' +
						'<div class="fourColsLabel">Construction Detail</div>' +
						'<div class="fourColsLabel">Strengthed for Heavy Cargo</div>' +
						'<div class="fourColsLabel">Segregated Ballast Tanks</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conDetStatcode5"></div>' +
						'<div id="conDetShiptype"></div>' +
						'<div id="conDetDetail"></div>' +
						'<div id="conDetHeavyCargo"></div>' +
						'<div id="conDetBallastTanks"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].conDetStatcode5 = checkNullField(response.vesseldata[0].conDetStatcode5);
			response.vesseldata[0].conDetShiptype = checkNullField(response.vesseldata[0].conDetShiptype);
			response.vesseldata[0].conDetDetail = checkNullField(response.vesseldata[0].conDetDetail);
			if(response.vesseldata[0].conDetHeavyCargo){
				var conDetailHeavyCargo = "no";
			} else {
				var conDetailHeavyCargo = "yes";
			}
			if(response.vesseldata[0].conDetBallastTanks){
				var conDetailSegBallast = "no";
			} else {
				var conDetailSegBallast = "yes";
			}			
		
			// display data
			$("#conDetStatcode5").html(response.vesseldata[0].conDetStatcode5);
			$("#conDetShiptype").html(response.vesseldata[0].conDetShiptype);
			$("#conDetDetail").html(response.vesseldata[0].conDetDetail);
			$("#conDetHeavyCargo").html(conDetailHeavyCargo);
			$("#conDetBallastTanks").html(conDetailSegBallast);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Construction Detail</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}	
function triggerConDimensions() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConDimensions2();
}	
function triggerConDimensions2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conDimensions&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Dimensions</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Design</div>' +
						'<div class="fourColsLabel">LOA (metres)</div>' +
						'<div class="fourColsLabel">Depth (metres)</div>' +
						'<div class="fourColsLabel">Draft (metres)</div>' +						
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conDesign"></div>' +
						'<div id="conLength"></div>' +
						'<div id="conDepth"></div>' +
						'<div id="conDraft"></div>' +	
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Beam (metres)</div>' +
						'<div class="fourColsLabel">LBP (metres)</div>' +
						'<div class="fourColsLabel">BCM (metres)</div>' +
						'<div class="fourColsLabel">KTMH (metres)</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conLBP"></div>' +
						'<div id="conBCM"></div>' +
						'<div id="conKTMH"></div>' +
						'<div id="conBeam"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>' +
				'<div style="font-size:x-small;">LOA = Length overall, LBP = Length between perpendiculars, BCM = Bow to center manifold, KTMH = Keel to masthead</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].conDesign = checkNullField(response.vesseldata[0].conDesign);
			response.vesseldata[0].conLength = checkNullField(response.vesseldata[0].conLength);
			response.vesseldata[0].conDepth = checkNullField(response.vesseldata[0].conDepth);
			response.vesseldata[0].conDraft = checkNullField(response.vesseldata[0].conDraft);
			response.vesseldata[0].conLBP = checkNullField(response.vesseldata[0].conLBP);
			response.vesseldata[0].conBCM = checkNullField(response.vesseldata[0].conBCM);
			response.vesseldata[0].conKTMH = checkNullField(response.vesseldata[0].conKTMH);
			response.vesseldata[0].conBeam = checkNullField(response.vesseldata[0].conBeam);
		
			// display data
			$("#conDesign").html(response.vesseldata[0].conDesign);
			$("#conLength").html(response.vesseldata[0].conLength);
			$("#conDepth").html(response.vesseldata[0].conDepth);
			$("#conDraft").html(response.vesseldata[0].conDraft);
			$("#conLBP").html(response.vesseldata[0].conLBP);
			$("#conBCM").html(response.vesseldata[0].conBCM);
			$("#conKTMH").html(response.vesseldata[0].conKTMH);
			$("#conBeam").html(response.vesseldata[0].conBeam);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Dimensions</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerConTonnages() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConTonnages2();	
}	
function triggerConTonnages2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conTonnages&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);

		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Tonnages</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">GT</div>' +
						'<div class="fourColsLabel">DWT</div>' +
						'<div class="fourColsLabel">NRT</div>' +
						'<div class="fourColsLabel">CGT</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conTonGt"></div>' +
						'<div id="conTonDwt"></div>' +
						'<div id="conTonNrt"></div>' +
						'<div id="conTonCgt"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">LDT</div>' +
						'<div class="fourColsLabel">TPC</div>' +
						'<div class="fourColsLabel">TPI</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conTonLdt"></div>' +
						'<div id="conTonTpc"></div>' +
						'<div id="conTonTpi"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>' +
				'<div style="font-size:x-small;">'+
				'GT = Gross Tonnage, DWT = Deadweight Tonnage, NRT = Net Tonnage, CGT = Compensated Gross Tonnage, LDT = Light Displacement Tonnage, TPC = Tons Per Centimeter, TPI = Tons Per Inch' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].conTonGt = checkNullField(response.vesseldata[0].conTonGt);
			response.vesseldata[0].conTonDwt = checkNullField(response.vesseldata[0].conTonDwt);
			response.vesseldata[0].conTonNrt = checkNullField(response.vesseldata[0].conTonNrt);
			response.vesseldata[0].conTonCgt = checkNullField(response.vesseldata[0].conTonCgt);
			response.vesseldata[0].conTonLdt = checkNullField(response.vesseldata[0].conTonLdt);
			response.vesseldata[0].conTonTpc = checkNullField(response.vesseldata[0].conTonTpc);
			response.vesseldata[0].conTonTpi= checkNullField(response.vesseldata[0].conTonTpi);
		
			// display data
			$("#conTonGt").html(response.vesseldata[0].conTonGt);
			$("#conTonDwt").html(response.vesseldata[0].conTonDwt);
			$("#conTonNrt").html(response.vesseldata[0].conTonNrt);
			$("#conTonCgt").html(response.vesseldata[0].conTonCgt);
			$("#conTonLdt").html(response.vesseldata[0].conTonLdt);
			$("#conTonTpc").html(response.vesseldata[0].conTonTpc);
			$("#conTonTpi").html(response.vesseldata[0].conTonTpi);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Tonnages</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerConArrangement() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConArrangement2();	
}	
function triggerConArrangement2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=conArrangement&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);

		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Arrangement</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Decks</div>' +
						'<div class="fourColsLabel">Tween Decks</div>' +
						'<div class="fourColsLabel">Fixed Decks</div>' +
						'<div class="fourColsLabel">FHMD (meters)</div>' +
						'<div class="fourColsLabel">Berths</div>' +
						'<div class="fourColsLabel">Holds</div>' +
						'<div class="fourColsLabel">Work Hold Dimensions</div>' +
						'<div class="fourColsLabel">Hatches</div>' +
						'<div class="fourColsLabel">Hatch Size</div>' +
						'<div class="fourColsLabel">Closed Loading</div>' +
						'<div class="fourColsLabel">Bow Loading</div>' +
						'<div class="fourColsLabel">Stern Loading Discharge</div>' +
						'<div class="fourColsLabel">Tanks (Deck)</div>' +
						'<div class="fourColsLabel">Tanks (Center)</div>' +
						'<div class="fourColsLabel">Tanks (Wing)</div>' +
						'<div class="fourColsLabel">Tanks (Slop)</div>' +
						'<div class="fourColsLabel">Tanks (Permanent Ballast)</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conArrDecks"></div>' +
						'<div id="conArrTweenDecks"></div>' +
						'<div id="conArrFixedDecks"></div>' +
						'<div id="conArrFhmd"></div>' +
						'<div id="conArrBerths"></div>' +
						'<div id="conArrHolds"></div>' +
						'<div id="conArrWhd"></div>' +
						'<div id="conArrHatches"></div>' +
						'<div id="conArrHatchSize"></div>' +
						'<div id="conArrClosedLoading"></div>' +
						'<div id="conArrBowLoading"></div>' +
						'<div id="conArrSternLoading"></div>' +
						'<div id="conArrTanksDeck"></div>' +
						'<div id="conArrTanksCenter"></div>' +
						'<div id="conArrTanksWing"></div>' +
						'<div id="conArrTanksSlop"></div>' +
						'<div id="conArrTanksPerm"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Cabins</div>' +
						'<div class="fourColsLabel">Number of Ramps</div>' +
						'<div class="fourColsLabel">Ramp 1 Length</div>' +
						'<div class="fourColsLabel">Ramp 1 Width</div>' +
						'<div class="fourColsLabel">Ramp 1 SWL</div>' +
						'<div class="fourColsLabel">Ramp 1 Clear Openings</div>' +
						'<div class="fourColsLabel">Ramp 1 Description</div>' +
						'<div class="fourColsLabel">Ramp 2 Length</div>' +
						'<div class="fourColsLabel">Ramp 2 Width</div>' +
						'<div class="fourColsLabel">Ramp 2 SWL</div>' +
						'<div class="fourColsLabel">Ramp 2 Clear Openings</div>' +
						'<div class="fourColsLabel">Ramp 2 Description</div>' +
						'<div class="fourColsLabel">Ramp 3 Length</div>' +
						'<div class="fourColsLabel">Ramp 3 Width</div>' +
						'<div class="fourColsLabel">Ramp 3 SWL</div>' +
						'<div class="fourColsLabel">Ramp 3 Clear Openings</div>' +
						'<div class="fourColsLabel">Ramp 3 Description</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="conArrCabins"></div>' +
						'<div id="conArrRamps"></div>' +
						'<div id="conArrRamp1L"></div>' +
						'<div id="conArrRamp1W"></div>' +
						'<div id="conArrRamp1Swl"></div>' +
						'<div id="conArrRamp1Co"></div>' +
						'<div id="conArrRamp1D"></div>' +
						'<div id="conArrRamp2L"></div>' +
						'<div id="conArrRamp2W"></div>' +
						'<div id="conArrRamp2Swl"></div>' +
						'<div id="conArrRamp2Co"></div>' +
						'<div id="conArrRamp2D"></div>' +
						'<div id="conArrRamp3L"></div>' +
						'<div id="conArrRamp3W"></div>' +
						'<div id="conArrRamp3Swl"></div>' +
						'<div id="conArrRamp3Co"></div>' +
						'<div id="conArrRamp3D"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>' +
				'<div style="font-size:x-small;">FHMD = Free height main deck, SWL = Safe working load</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			var tween = 'no';
			var closed = 'no';
			var bow = 'no';
			var stern = 'no';
			response.vesseldata[0].conArrTanksDeck = checkNullField(response.vesseldata[0].conArrTanksDeck);
			if (!(response.vesseldata[0].conArrTweenDecks)) {
				tween = 'yes';
			}
			if (!(response.vesseldata[0].conArrClosedLoading == '0')) {
				closed = 'yes';
			}
			if (!(response.vesseldata[0].conArrBowLoading == '0')) {
				bow = 'yes';
			}
			if (!(response.vesseldata[0].conArrSternLoading == '0')) {
				stern = 'yes';
			}
			response.vesseldata[0].conArrFhmd = checkNullField(response.vesseldata[0].conArrFhmd);
			response.vesseldata[0].conArrHatchSize = checkNullField(response.vesseldata[0].conArrHatchSize);
			response.vesseldata[0].conArrHatches = checkNullField(response.vesseldata[0].conArrHatches);
			response.vesseldata[0].conArrDecks = checkNullField(response.vesseldata[0].conArrDecks);
			response.vesseldata[0].conArrRamps = checkNullField(response.vesseldata[0].conArrRamps);
			response.vesseldata[0].conArrRamp1D = checkNullField(response.vesseldata[0].conArrRamp1D);
			response.vesseldata[0].conArrRamp2D = checkNullField(response.vesseldata[0].conArrRamp2D);
			response.vesseldata[0].conArrRamp3D = checkNullField(response.vesseldata[0].conArrRamp3D);
			response.vesseldata[0].conArrRamp1L = checkNullField(response.vesseldata[0].conArrRamp1L);
			response.vesseldata[0].conArrRamp2L = checkNullField(response.vesseldata[0].conArrRamp2L);
			response.vesseldata[0].conArrRamp3L = checkNullField(response.vesseldata[0].conArrRamp3L);
			response.vesseldata[0].conArrRamp1W = checkNullField(response.vesseldata[0].conArrRamp1W);
			response.vesseldata[0].conArrRamp2W = checkNullField(response.vesseldata[0].conArrRamp2W);
			response.vesseldata[0].conArrRamp3W = checkNullField(response.vesseldata[0].conArrRamp3W);
			response.vesseldata[0].conArrRamp1Swl = checkNullField(response.vesseldata[0].conArrRamp1Swl);
			response.vesseldata[0].conArrRamp2Swl = checkNullField(response.vesseldata[0].conArrRamp2Swl);
			response.vesseldata[0].conArrRamp3Swl = checkNullField(response.vesseldata[0].conArrRamp3Swl);
			response.vesseldata[0].conArrRamp1Co = checkNullField(response.vesseldata[0].conArrRamp1Co);
			response.vesseldata[0].conArrRamp2Co = checkNullField(response.vesseldata[0].conArrRamp2Co);
			response.vesseldata[0].conArrRamp3Co = checkNullField(response.vesseldata[0].conArrRamp3Co);
			response.vesseldata[0].conArrFixedDecks = checkNullField(response.vesseldata[0].conArrFixedDecks);
			response.vesseldata[0].conArrTanksCenter = checkNullField(response.vesseldata[0].conArrTanksCenter);
			response.vesseldata[0].conArrTanksWing = checkNullField(response.vesseldata[0].conArrTanksWing);
			response.vesseldata[0].conArrTanksSlop = checkNullField(response.vesseldata[0].conArrTanksSlop);
			response.vesseldata[0].conArrTanksPerm = checkNullField(response.vesseldata[0].conArrTanksPerm);
			response.vesseldata[0].conArrBerths = checkNullField(response.vesseldata[0].conArrBerths);
			response.vesseldata[0].conArrCabins = checkNullField(response.vesseldata[0].conArrCabins);
			response.vesseldata[0].conArrWhd = checkNullField(response.vesseldata[0].conArrWhd);
			response.vesseldata[0].conArrHolds = checkNullField(response.vesseldata[0].conArrHolds);
			
			// display data
			$("#conArrFhmd").html(response.vesseldata[0].conArrFhmd);
			$("#conArrHatchSize").html(response.vesseldata[0].conArrHatchSize);
			$("#conArrHatches").html(response.vesseldata[0].conArrHatches);
			$("#conArrDecks").html(response.vesseldata[0].conArrDecks);
			$("#conArrRamps").html(response.vesseldata[0].conArrRamps);
			$("#conArrRamp1D").html(response.vesseldata[0].conArrRamp1D);
			$("#conArrRamp2D").html(response.vesseldata[0].conArrRamp2D);
			$("#conArrRamp3D").html(response.vesseldata[0].conArrRamp3D);
			$("#conArrRamp1L").html(response.vesseldata[0].conArrRamp1L);
			$("#conArrRamp2L").html(response.vesseldata[0].conArrRamp2L);
			$("#conArrRamp3L").html(response.vesseldata[0].conArrRamp3L);
			$("#conArrRamp1W").html(response.vesseldata[0].conArrRamp1W);
			$("#conArrRamp2W").html(response.vesseldata[0].conArrRamp2W);
			$("#conArrRamp3W").html(response.vesseldata[0].conArrRamp3W);
			$("#conArrRamp1Swl").html(response.vesseldata[0].conArrRamp1Swl);
			$("#conArrRamp2Swl").html(response.vesseldata[0].conArrRamp2Swl);
			$("#conArrRamp3Swl").html(response.vesseldata[0].conArrRamp3Swl);
			$("#conArrRamp1Co").html(response.vesseldata[0].conArrRamp1Co);
			$("#conArrRamp2Co").html(response.vesseldata[0].conArrRamp2Co);
			$("#conArrRamp3Co").html(response.vesseldata[0].conArrRamp3Co);
			$("#conArrFixedDecks").html(response.vesseldata[0].conArrFixedDecks);
			$("#conArrTanksCenter").html(response.vesseldata[0].conArrTanksCenter);
			$("#conArrTanksWing").html(response.vesseldata[0].conArrTanksWing);
			$("#conArrTanksSlop").html(response.vesseldata[0].conArrTanksSlop);
			$("#conArrTanksPerm").html(response.vesseldata[0].conArrTanksPerm);
			$("#conArrBerths").html(response.vesseldata[0].conArrBerths);
			$("#conArrTweenDecks").html(tween);
			$("#conArrCabins").html(response.vesseldata[0].conArrCabins);
			$("#conArrWhd").html(response.vesseldata[0].conArrWhd);
			$("#conArrHolds").html(response.vesseldata[0].conArrHolds);
			$("#conArrClosedLoading").html(closed);
			$("#conArrBowLoading").html(bow);
			$("#conArrSternLoading").html(stern);
			$("#conArrTanksDeck").html(response.vesseldata[0].conArrTanksDeck);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Arrangements</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerConViewAll() {
	if(checkImo()){return;};
	
	createConstructionTitle();
	triggerConOverview2();
	triggerConShipbuilder2();
	triggerConStatus2();
	triggerConConstructionDetail2();
	triggerConDimensions2();
	triggerConTonnages2();
	triggerConArrangement2();
}	

// Get information from database and show Cargo and Gear info in main panel
function createCargoAndGearTitle() {
	$(".mainPanel").html(
		'<div class="title">Cargo & Gear</div>'		
	);
}
function triggerCngOverview() {
	if(checkImo()){return;};
	
	createCargoAndGearTitle();
	triggerCngOverview2();
}
function triggerCngOverview2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=cngOverview&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Overview</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Container Arrangement</div>' +
						'<div class="fourColsLabel">Grain (cubic meters)</div>' +
						'<div class="fourColsLabel">Bale (cubic meters)</div>' +
						'<div class="fourColsLabel">TEU (cubic meters)</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="cngArrangement"></div>' +
						'<div id="cngGrain"></div>' +
						'<div id="cngBale"></div>' +
						'<div id="cngTeu"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
			
			// format data; remove NULL strings
			response.vesseldata[0].cngArrangement = checkNullField(response.vesseldata[0].cngArrangement);
			response.vesseldata[0].cngGrain = checkNullField(response.vesseldata[0].cngGrain);
			response.vesseldata[0].cngBale = checkNullField(response.vesseldata[0].cngBale);
			response.vesseldata[0].cngTeu = checkNullField(response.vesseldata[0].cngTeu);
		
			// display data
			$("#cngArrangement").html(response.vesseldata[0].cngArrangement);
			$("#cngGrain").html(response.vesseldata[0].cngGrain);
			$("#cngBale").html(response.vesseldata[0].cngBale);
			$("#cngTeu").html(response.vesseldata[0].cngTeu);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Overview</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerCngCargo() {
	if(checkImo()){return;};
	
	createCargoAndGearTitle();
	triggerCngCargo2();
}
function triggerCngCargo2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=cngCargo&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Cargo</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Grades</div>' +
						'<div class="fourColsLabel">Tanks</div>' +
						'<div class="fourColsLabel">Holds</div>' +
						'<div class="fourColsLabel">Lash</div>' +
						'<div class="fourColsLabel">Ore</div>' +
						'<div class="fourColsLabel">Liquid</div>' +
						'<div class="fourColsLabel">Reefer Capacity</div>' +
						'<div class="fourColsLabel">Reefer TEU</div>' +
						'<div class="fourColsLabel">Passengers</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="cngCargoGrades"></div>' +
						'<div id="cngCargoTanks"></div>' +
						'<div id="cngCargoHolds"></div>' +
						'<div id="cngCargoLash"></div>' +
						'<div id="cngCargoLiquid"></div>' +
						'<div id="cngCargoOre"></div>' +
						'<div id="cngCargoReeferCap"></div>' +
						'<div id="cngCargoReeferTeu"></div>' +
						'<div id="cngCargoPassengers"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Cars</div>' +
						'<div class="fourColsLabel">Rail Cars</div>' +
						'<div class="fourColsLabel">Cars and Trucks</div>' +
						'<div class="fourColsLabel">Trailers</div>' +
						'<div class="fourColsLabel">Car Lane Meters</div>' +
						'<div class="fourColsLabel">Total Lane Meters</div>' +
						'<div class="fourColsLabel">Track Lane Meters</div>' +
						'<div class="fourColsLabel">Trailer Lane Meters</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="cngCargoCars"></div>' +
						'<div id="cngCargoRailCars"></div>' +
						'<div id="cngCargoCarsAndTrucks"></div>' +
						'<div id="cngCargoTrailers"></div>' +
						'<div id="cngCargoCarLM"></div>' +
						'<div id="cngCargoTotalLM"></div>' +
						'<div id="cngCargoTrackLM"></div>' +
						'<div id="cngCargoTrailerLM"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].cngCargoGrades = checkNullField(response.vesseldata[0].cngCargoGrades);
			response.vesseldata[0].cngCargoTanks = checkNullField(response.vesseldata[0].cngCargoTanks);
			response.vesseldata[0].cngCargoHolds = checkNullField(response.vesseldata[0].cngCargoHolds);
			response.vesseldata[0].cngCargoLash = checkNullField(response.vesseldata[0].cngCargoLash);
			response.vesseldata[0].cngCargoLiquid = checkNullField(response.vesseldata[0].cngCargoLiquid);
			response.vesseldata[0].cngCargoOre = checkNullField(response.vesseldata[0].cngCargoOre);
			response.vesseldata[0].cngCargoReeferCap = checkNullField(response.vesseldata[0].cngCargoReeferCap);
			response.vesseldata[0].cngCargoReeferTeu = checkNullField(response.vesseldata[0].cngCargoReeferTeu);
			response.vesseldata[0].cngCargoPassengers = checkNullField(response.vesseldata[0].cngCargoPassengers);
			response.vesseldata[0].cngCargoCars = checkNullField(response.vesseldata[0].cngCargoCars);
			response.vesseldata[0].cngCargoRailCars = checkNullField(response.vesseldata[0].cngCargoRailCars);
			response.vesseldata[0].cngCargoCarsAndTrucks = checkNullField(response.vesseldata[0].cngCargoCarsAndTrucks);
			response.vesseldata[0].cngCargoTrailers = checkNullField(response.vesseldata[0].cngCargoTrailers);
			response.vesseldata[0].cngCargoCarLM = checkNullField(response.vesseldata[0].cngCargoCarLM);
			response.vesseldata[0].cngCargoTotalLM = checkNullField(response.vesseldata[0].cngCargoTotalLM);
			response.vesseldata[0].cngCargoTrackLM = checkNullField(response.vesseldata[0].cngCargoTrackLM);
			response.vesseldata[0].cngCargoTrailerLM = checkNullField(response.vesseldata[0].cngCargoTrailerLM);
		
			// display data
			$("#cngCargoGrades").html(response.vesseldata[0].cngCargoGrades);
			$("#cngCargoTanks").html(response.vesseldata[0].cngCargoTanks);
			$("#cngCargoHolds").html(response.vesseldata[0].cngCargoHolds);
			$("#cngCargoLash").html(response.vesseldata[0].cngCargoLash);
			$("#cngCargoLiquid").html(response.vesseldata[0].cngCargoLiquid);
			$("#cngCargoOre").html(response.vesseldata[0].cngCargoOre);
			$("#cngCargoReeferCap").html(response.vesseldata[0].cngCargoReeferCap);
			$("#cngCargoReeferTeu").html(response.vesseldata[0].cngCargoReeferTeu);
			$("#cngCargoPassengers").html(response.vesseldata[0].cngCargoPassengers);
			$("#cngCargoCars").html(response.vesseldata[0].cngCargoCars);
			$("#cngCargoRailCars").html(response.vesseldata[0].cngCargoRailCars);
			$("#cngCargoCarsAndTrucks").html(response.vesseldata[0].cngCargoCarsAndTrucks);
			$("#cngCargoTrailers").html(response.vesseldata[0].cngCargoTrailers);
			$("#cngCargoCarLM").html(response.vesseldata[0].cngCargoCarLM);
			$("#cngCargoTotalLM").html(response.vesseldata[0].cngCargoTotalLM);
			$("#cngCargoTrackLM").html(response.vesseldata[0].cngCargoTrackLM);
			$("#cngCargoTrailerLM").html(response.vesseldata[0].cngCargoTrailerLM);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Cargo</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerCngGears() {
	if(checkImo()){return;};
	
	createCargoAndGearTitle();
	triggerCngGears2();
}
function triggerCngGears2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=cngGears&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Gears</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Gear Type</div>' +
						'<div class="fourColsLabel">Gear Description</div>' +
						'<div class="fourColsLabel">Gear SWL</div>' +
						'<div class="fourColsLabel">Pummp Type</div>' +
						'<div class="fourColsLabel">Pump Description</div>' +
						'<div class="fourColsLabel">Pump Rating</div>' +
						'<div class="fourColsLabel">Rump Total Capacity</div>' +
						'<div class="fourColsLabel">Pump Stripping</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="cngGearType"></div>' +
						'<div id="cngGearDesc"></div>' +
						'<div id="cngGearSWL"></div>' +
						'<div id="cngPumpType"></div>' +
						'<div id="cngPumpDesc"></div>' +
						'<div id="cngPumpRating"></div>' +
						'<div id="cngPumpsTotalCap"></div>' +
						'<div id="cngPumpsStripping"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Pump 1</div>' +
						'<div class="fourColsLabel">Pump 1 Capacity</div>' +
						'<div class="fourColsLabel">Pump 2</div>' +
						'<div class="fourColsLabel">Pump 2 Capacity</div>' +
						'<div class="fourColsLabel">Pump 3</div>' +
						'<div class="fourColsLabel">Pump 3 Capacity</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="cngCargoPumps1"></div>' +
						'<div id="cngCargoPumps1Cap"></div>' +
						'<div id="cngCargoPumps2"></div>' +
						'<div id="cngCargoPumps2Cap"></div>' +
						'<div id="cngCargoPumps3"></div>' +
						'<div id="cngCargoPumps3Cap"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>' + 
				'<div style="font-size:x-small;">SWL = Safe working load</div>' + 
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].cngGearType = checkNullField(response.vesseldata[0].cngGearType);
			response.vesseldata[0].cngGearDesc = checkNullField(response.vesseldata[0].cngGearDesc);
			response.vesseldata[0].cngGearSWL = checkNullField(response.vesseldata[0].cngGearSWL);
			response.vesseldata[0].cngPumpType = checkNullField(response.vesseldata[0].cngPumpType);
			response.vesseldata[0].cngPumpDesc = checkNullField(response.vesseldata[0].cngPumpDesc);
			response.vesseldata[0].cngPumpRating = checkNullField(response.vesseldata[0].cngPumpRating);
			response.vesseldata[0].cngPumpsTotalCap = checkNullField(response.vesseldata[0].cngPumpsTotalCap);
			response.vesseldata[0].cngPumpsStripping = checkNullField(response.vesseldata[0].cngPumpsStripping);
			response.vesseldata[0].cngCargoPumps1 = checkNullField(response.vesseldata[0].cngCargoPumps1);
			response.vesseldata[0].cngCargoPumps1Cap = checkNullField(response.vesseldata[0].cngCargoPumps1Cap);
			response.vesseldata[0].cngCargoPumps2 = checkNullField(response.vesseldata[0].cngCargoPumps2);
			response.vesseldata[0].cngCargoPumps2Cap = checkNullField(response.vesseldata[0].cngCargoPumps2Cap);
			response.vesseldata[0].cngCargoPumps3 = checkNullField(response.vesseldata[0].cngCargoPumps3);
			response.vesseldata[0].cngCargoPumps3Cap = checkNullField(response.vesseldata[0].cngCargoPumps3Cap);
		
			// display data
			$("#cngGearType").html(response.vesseldata[0].cngGearType);
			$("#cngGearDesc").html(response.vesseldata[0].cngGearDesc);
			$("#cngGearSWL").html(response.vesseldata[0].cngGearSWL);
			$("#cngPumpType").html(response.vesseldata[0].cngPumpType);
			$("#cngPumpDesc").html(response.vesseldata[0].cngPumpDesc);
			$("#cngPumpRating").html(response.vesseldata[0].cngPumpRating);
			$("#cngPumpsTotalCap").html(response.vesseldata[0].cngPumpsTotalCap);
			$("#cngPumpsStripping").html(response.vesseldata[0].cngPumpsStripping);
			$("#cngCargoPumps1").html(response.vesseldata[0].cngCargoPumps1);
			$("#cngCargoPumps1Cap").html(response.vesseldata[0].cngCargoPumps1Cap);
			$("#cngCargoPumps2").html(response.vesseldata[0].cngCargoPumps2);
			$("#cngCargoPumps2Cap").html(response.vesseldata[0].cngCargoPumps2Cap);
			$("#cngCargoPumps3").html(response.vesseldata[0].cngCargoPumps3);
			$("#cngCargoPumps3Cap").html(response.vesseldata[0].cngCargoPumps3Cap);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Gears</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerCngViewAll() {
	if(checkImo()){return;};
	
	createCargoAndGearTitle();
	triggerCngOverview2();
	triggerCngCargo2();
	triggerCngGears2();
}
	
// Get information from database and show Machinery info in main panel	
function createMachineryTitle() {
	$(".mainPanel").html(
		'<div class="title">Machinery</div>'	
	);
}
function triggerMacPrimeMover() {
	if(checkImo()){return;};
	
	createMachineryTitle();
	triggerMacPrimeMover2();
}
function triggerMacPrimeMover2() {
	var searchType = $('#searchType').find(":selected").val();
	var searchTerm = $('#searchTerm').val();
	var phpWithArg = "query_vessel_details.php?source=macPrimeMover&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Prime Mover</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Engine Builder</div>' +	
						'<div class="fourColsLabel">Engine Details</div>' +	
						'<div class="fourColsLabel">Engine Make</div>' +
						'<div class="fourColsLabel">Engine Model</div>' +
						'<div class="fourColsLabel">Engine Type</div>' +
						'<div class="fourColsLabel">Engine Layout</div>' +
						'<div class="fourColsLabel">Number of Engines</div>' +
						'<div class="fourColsLabel">Speed</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="macEngineBuilder"></div>' +
						'<div id="macEngineDetails"></div>' +
						'<div id="macEngineMake"></div>' +
						'<div id="macEngineModel"></div>' +
						'<div id="macEngineType"></div>' +
						'<div id="macEngineLayout"></div>' +
						'<div id="macEngineNumber"></div>' +
						'<div id="macEngineSpeed"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">RPM</div>' +
						'<div class="fourColsLabel">Stroke</div>' +
						'<div class="fourColsLabel">Total HP</div>' +
						'<div class="fourColsLabel">Total KW</div>' +	
						'<div class="fourColsLabel">Propulsion Type</div>' +	
						'<div class="fourColsLabel">Propulsion Units</div>' +	
						'<div class="fourColsLabel">Cylinder Bore</div>' +	
						'<div class="fourColsLabel">Cylinder Stroke</div>' +	
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="macEngineRPM"></div>' +
						'<div id="macEngineStroke"></div>' +
						'<div id="macEngineHP"></div>' +
						'<div id="macEngineKW"></div>' +
						'<div id="macPropulsionType"></div>' +
						'<div id="macPropulsionUnits"></div>' +
						'<div id="macCylinderBore"></div>' +
						'<div id="macCylinderStroke"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].macEngineBuilder = checkNullField(response.vesseldata[0].macEngineBuilder);
			response.vesseldata[0].macEngineDetails = checkNullField(response.vesseldata[0].macEngineDetails);
			response.vesseldata[0].macEngineLayout = checkNullField(response.vesseldata[0].macEngineLayout);
			response.vesseldata[0].macEngineMake = checkNullField(response.vesseldata[0].macEngineMake);
			response.vesseldata[0].macEngineModel = checkNullField(response.vesseldata[0].macEngineModel);
			response.vesseldata[0].macEngineNumber = checkNullField(response.vesseldata[0].macEngineNumber);
			response.vesseldata[0].macEngineRPM = checkNullField(response.vesseldata[0].macEngineRPM);
			response.vesseldata[0].macEngineSpeed = checkNullField(response.vesseldata[0].macEngineSpeed);
			response.vesseldata[0].macEngineStroke = checkNullField(response.vesseldata[0].macEngineStroke);
			response.vesseldata[0].macEngineHP = checkNullField(response.vesseldata[0].macEngineHP);
			response.vesseldata[0].macEngineKW = checkNullField(response.vesseldata[0].macEngineKW);
			response.vesseldata[0].macEngineType = checkNullField(response.vesseldata[0].macEngineType);
			response.vesseldata[0].macPropulsionType = checkNullField(response.vesseldata[0].macPropulsionType);
			response.vesseldata[0].macPropulsionUnits = checkNullField(response.vesseldata[0].macPropulsionUnits);
			response.vesseldata[0].macCylinderBore = checkNullField(response.vesseldata[0].macCylinderBore);
			response.vesseldata[0].macCylinderStroke = checkNullField(response.vesseldata[0].macCylinderStroke);
			
			//display data
			$("#macEngineBuilder").html(response.vesseldata[0].macEngineBuilder);
			$("#macEngineDetails").html(response.vesseldata[0].macEngineDetails);
			$("#macEngineLayout").html(response.vesseldata[0].macEngineLayout);
			$("#macEngineMake").html(response.vesseldata[0].macEngineMake);
			$("#macEngineModel").html(response.vesseldata[0].macEngineModel);
			$("#macEngineNumber").html(response.vesseldata[0].macEngineNumber);
			$("#macEngineRPM").html(response.vesseldata[0].macEngineRPM);
			$("#macEngineSpeed").html(response.vesseldata[0].macEngineSpeed);
			$("#macEngineStroke").html(response.vesseldata[0].macEngineStroke);
			$("#macEngineHP").html(response.vesseldata[0].macEngineHP);
			$("#macEngineKW").html(response.vesseldata[0].macEngineKW);
			$("#macEngineType").html(response.vesseldata[0].macEngineType);
			$("#macPropulsionType").html(response.vesseldata[0].macPropulsionType);
			$("#macPropulsionUnits").html(response.vesseldata[0].macPropulsionUnits);
			$("#macCylinderBore").html(response.vesseldata[0].macCylinderBore);
			$("#macCylinderStroke").html(response.vesseldata[0].macCylinderStroke);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Prime Mover</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerMacThrusters() {
	if(checkImo()){return;};
	
	createMachineryTitle();
	triggerMacThrusters2();
}
function triggerMacThrusters2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=macThrusters&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Thrusters</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Thrusters</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="macThrusters"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
			
			// format data; remove NULL strings
			response.vesseldata[0].macThrusters = checkNullField(response.vesseldata[0].macThrusters);
		
			// display data
			$("#macThrusters").html(response.vesseldata[0].macThrusters);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Thrusters</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerMacViewAll() {
	if(checkImo()){return;};
	
	createMachineryTitle();
	triggerMacPrimeMover2();
	triggerMacThrusters2();
}
	
// Get information from database and show Classified info in main panel	
function createClassifiedTitle() {
	$(".mainPanel").html(
		'<div class="title">Classified</div>'	
	);
}
function triggerClaInspections() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaInspections2();
}
function triggerClaInspections2() {
	var phpWithArg = "query_vessel_details.php?source=claInspections&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		num = response.resultcount;
		
		if (response.resultcount > 0) {
			for(var i=0;i<response.vesseldata.length;i++){
				// build HTML code
				if (i < 1) {
					$(".mainPanel").append(
					'<div class="subtitle">Inspections</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">ID</div>' +
							'<div class="fourColsLabel">Date</div>' +
							'<div class="fourColsLabel">Source</div>' +
							'<div class="fourColsLabel">Port</div>' +
							'<div class="fourColsLabel">Country</div>' +
							'<div class="fourColsLabel">Type</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspId' + i + '"></div>' +
							'<div id="claInspDate' + i + '"></div>' +
							'<div id="claInspSource' + i + '"></div>' +
							'<div id="claInspPort' + i + '"></div>' +
							'<div id="claInspCountry' + i + '"></div>' +
							'<div id="claInspType' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Detained</div>' +
							'<div class="fourColsLabel">Days Detained</div>' +						
							'<div class="fourColsLabel">Release Date</div>' +
							'<div class="fourColsLabel">Authorization</div>' +
							'<div class="fourColsLabel">Manager</div>' +
							'<div class="fourColsLabel">Owner</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspDetained' + i + '"></div>' +
							'<div id="claInspDaysDetained' + i + '"></div>' +						
							'<div id="claInspReleaseDate' + i + '"></div>' +
							'<div id="claInspAuthorisation' + i + '"></div>' +
							'<div id="claInspManager' + i + '"></div>' +
							'<div id="claInspOwner' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Defects</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspDefects' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div><hr></div>'
					);
				} else {
					$(".mainPanel").append(
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">ID</div>' +
							'<div class="fourColsLabel">Date</div>' +
							'<div class="fourColsLabel">Source</div>' +
							'<div class="fourColsLabel">Port</div>' +
							'<div class="fourColsLabel">Country</div>' +
							'<div class="fourColsLabel">Type</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspId' + i + '"></div>' +
							'<div id="claInspDate' + i + '"></div>' +
							'<div id="claInspSource' + i + '"></div>' +
							'<div id="claInspPort' + i + '"></div>' +
							'<div id="claInspCountry' + i + '"></div>' +
							'<div id="claInspType' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Detained</div>' +
							'<div class="fourColsLabel">Days Detained</div>' +						
							'<div class="fourColsLabel">Release Date</div>' +
							'<div class="fourColsLabel">Authorization</div>' +
							'<div class="fourColsLabel">Manager</div>' +
							'<div class="fourColsLabel">Owner</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspDetained' + i + '"></div>' +
							'<div id="claInspDaysDetained' + i + '"></div>' +						
							'<div id="claInspReleaseDate' + i + '"></div>' +
							'<div id="claInspAuthorisation' + i + '"></div>' +
							'<div id="claInspManager' + i + '"></div>' +
							'<div id="claInspOwner' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Defects</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspDefects' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div><hr></div>'
					);
				}
				
							
				// format data; remove NULL strings
				response.vesseldata[i].claInspId = checkNullField(response.vesseldata[i].claInspId);
				response.vesseldata[i].claInspDate = checkNullField(response.vesseldata[i].claInspDate);
				response.vesseldata[i].claInspSource = checkNullField(response.vesseldata[i].claInspSource);
				response.vesseldata[i].claInspPort = checkNullField(response.vesseldata[i].claInspPort);
				response.vesseldata[i].claInspCountry = checkNullField(response.vesseldata[i].claInspCountry);
				response.vesseldata[i].claInspType = checkNullField(response.vesseldata[i].claInspType);
				response.vesseldata[i].claInspDetained = checkNullField(response.vesseldata[i].claInspDetained);
				response.vesseldata[i].claInspDaysDetained = checkNullField(response.vesseldata[i].claInspDaysDetained);
				response.vesseldata[i].claInspDefects = checkNullField(response.vesseldata[i].claInspDefects);
				response.vesseldata[i].claInspReleaseDate = checkNullField(response.vesseldata[i].claInspReleaseDate);
				response.vesseldata[i].claInspAuthorisation = checkNullField(response.vesseldata[i].claInspAuthorisation);
				response.vesseldata[i].claInspManager = checkNullField(response.vesseldata[i].claInspManager);
				response.vesseldata[i].claInspOwner = checkNullField(response.vesseldata[i].claInspOwner);

				// display data
				$("#claInspId"+i).html(response.vesseldata[i].claInspId);
				$("#claInspDate"+i).html(response.vesseldata[i].claInspDate);
				$("#claInspSource"+i).html(response.vesseldata[i].claInspSource);
				$("#claInspPort"+i).html(response.vesseldata[i].claInspPort);
				$("#claInspCountry"+i).html(response.vesseldata[i].claInspCountry);
				$("#claInspType"+i).html(response.vesseldata[i].claInspType);
				if(response.vesseldata[i].claInspDetained == "0") {
					$("#claInspDetained"+i).html('no');
				} else {
					$("#claInspDetained"+i).html('yes');
				}
				$("#claInspDaysDetained"+i).html(response.vesseldata[i].claInspDaysDetained);
				$("#claInspDefects"+i).html(response.vesseldata[i].claInspDefects);
				$("#claInspReleaseDate"+i).html(response.vesseldata[i].claInspReleaseDate);
				$("#claInspAuthorisation"+i).html(response.vesseldata[i].claInspAuthorisation);
				$("#claInspManager"+i).html(response.vesseldata[i].claInspManager);
				$("#claInspOwner"+i).html(response.vesseldata[i].claInspOwner);
			}		
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Inspections</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaCertificates() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaCertificates2();
}
function triggerClaCertificates2() {
	var phpWithArg = "query_vessel_details.php?source=claCertificates&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			for(var i=0;i<response.vesseldata.length;i++){
				// build HTML code
				if (i<1) {
					$(".mainPanel").append(
					'<div class="subtitle">Certificates</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Certificate ID</div>' +
							'<div class="fourColsLabel">Insepction ID</div>' +
							'<div class="fourColsLabel">Certificate Code</div>' +
							'<div class="fourColsLabel">Certificate Title</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCertId' + i + '"></div>' +
							'<div id="claCertInsp' + i + '"></div>' +
							'<div id="claCertCode' + i + '"></div>' +
							'<div id="claCertTitle' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Issuing Authority</div>' +
							'<div class="fourColsLabel">Issue Date</div>' +
							'<div class="fourColsLabel">Expiry Date</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCertIssueAuthority' + i + '"></div>' +
							'<div id="claCertIssueDate' + i + '"></div>' +
							'<div id="claCertExpiryDate' + i + '"></div>' +
						'</div>' +
					'</div><div><hr></div>'
					);
				} else {
					$(".mainPanel").append(
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Certificate ID</div>' +
							'<div class="fourColsLabel">Insepction ID</div>' +
							'<div class="fourColsLabel">Certificate Code</div>' +
							'<div class="fourColsLabel">Certificate Title</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCertId' + i + '"></div>' +
							'<div id="claCertInsp' + i + '"></div>' +
							'<div id="claCertCode' + i + '"></div>' +
							'<div id="claCertTitle' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Issuing Authority</div>' +
							'<div class="fourColsLabel">Issue Date</div>' +
							'<div class="fourColsLabel">Expiry Date</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCertIssueAuthority' + i + '"></div>' +
							'<div id="claCertIssueDate' + i + '"></div>' +
							'<div id="claCertExpiryDate' + i + '"></div>' +
						'</div>' +
					'</div><div><hr></div>'
					);
				}
				
				// format data; remove NULL strings
				response.vesseldata[i].claCertId = checkNullField(response.vesseldata[i].claCertId);
				response.vesseldata[i].claCertInsp = checkNullField(response.vesseldata[i].claCertInsp);
				response.vesseldata[i].claCertCode = checkNullField(response.vesseldata[i].claCertCode);
				response.vesseldata[i].claCertTitle = checkNullField(response.vesseldata[i].claCertTitle);
				response.vesseldata[i].claCertIssueAuthority = checkNullField(response.vesseldata[i].claCertIssueAuthority);
				response.vesseldata[i].claCertIssueDate = checkNullField(response.vesseldata[i].claCertIssueDate);
				response.vesseldata[i].claCertExpiryDate = checkNullField(response.vesseldata[i].claCertExpiryDate);
				
				// display data
				$("#claCertId"+i).html(response.vesseldata[i].claCertId);
				$("#claCertInsp"+i).html(response.vesseldata[i].claCertInsp);
				$("#claCertCode"+i).html(response.vesseldata[i].claCertCode);
				$("#claCertTitle"+i).html(response.vesseldata[i].claCertTitle);
				$("#claCertIssueAuthority"+i).html(response.vesseldata[i].claCertIssueAuthority);
				$("#claCertIssueDate"+i).html(response.vesseldata[i].claCertIssueDate);	
				$("#claCertExpiryDate"+i).html(response.vesseldata[i].claCertExpiryDate);	
			}		
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Certificates</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaSafety() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaSafety2();
}
function triggerClaSafety2() {
	// create phpWithArgs
	var phpWithArg = "query_vessel_details.php?source=claSafety&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").append(
				'<div class="subtitle">Safety</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Chemical Class</div>' +
						'<div class="fourColsLabel">Inert Gas System</div>' +
						'<div class="fourColsLabel">Crude Oil Washing</div>' +
						'<div class="fourColsLabel">Vapour Recovery System</div>' +
						'<div class="fourColsLabel">Internal Watertight Doors</div>' +							
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="claSafetyChemical"></div>' +
						'<div id="claSafetyInertGas"></div>' +
						'<div id="claSafetyOilWashing"></div>' +
						'<div id="claSafetyVapourRecovery"></div>' +
						'<div id="claSafetyWatertightDoors"></div>' +
					'</div>' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Heating Coils</div>' +
						'<div class="fourColsLabel">Heating Type</div>' +
						'<div class="fourColsLabel">Max Temp (&#176; Celcius)</div>' +
						'<div class="fourColsLabel">Min Temp (&#176; Celcius)</div>' +
						'<div class="fourColsLabel">Coats</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="claSafetyCoils"></div>' +
						'<div id="claSafetyHeatingType"></div>' +
						'<div id="claSafetyMaxTemp"></div>' +
						'<div id="claSafetyMinTemp"></div>' +
						'<div id="claSafetyCoats"></div>' +
					'</div>' +
				'</div>' +
				'<div>&nbsp;</div>'
			);
			
			// format data; remove NULL strings
			response.vesseldata[0].claSafetyChemical = checkNullField(response.vesseldata[0].claSafetyChemical);
			response.vesseldata[0].claSafetyInertGas = checkNullField(response.vesseldata[0].claSafetyInertGas);
			response.vesseldata[0].claSafetyOilWashing = checkNullField(response.vesseldata[0].claSafetyOilWashing);
			response.vesseldata[0].claSafetyVapourRecovery = checkNullField(response.vesseldata[0].claSafetyVapourRecovery);
			response.vesseldata[0].claSafetyWatertightDoors = checkNullField(response.vesseldata[0].claSafetyWatertightDoors);
			response.vesseldata[0].claSafetyCoils = checkNullField(response.vesseldata[0].claSafetyCoils);
			response.vesseldata[0].claSafetyHeatingType = checkNullField(response.vesseldata[0].claSafetyHeatingType);
			response.vesseldata[0].claSafetyMaxTemp = checkNullField(response.vesseldata[0].claSafetyMaxTemp);
			response.vesseldata[0].claSafetyMinTemp = checkNullField(response.vesseldata[0].claSafetyMinTemp);
			response.vesseldata[0].claSafetyCoats = checkNullField(response.vesseldata[0].claSafetyCoats);
		
			// display data
			$("#claSafetyChemical").html(response.vesseldata[0].claSafetyChemical);
			$("#claSafetyInertGas").html(response.vesseldata[0].claSafetyInertGas > 0 ? 'yes':'no');
			$("#claSafetyOilWashing").html(response.vesseldata[0].claSafetyOilWashing > 0 ? 'yes':'no');
			$("#claSafetyVapourRecovery").html(response.vesseldata[0].claSafetyVapourRecovery > 0 ? 'yes':'no');
			$("#claSafetyWatertightDoors").html(response.vesseldata[0].claSafetyWatertightDoors > 0 ? 'yes':'no');
			$("#claSafetyCoils").html(response.vesseldata[0].claSafetyCoils > 0 ? 'yes':'no');
			$("#claSafetyHeatingType").html(response.vesseldata[0].claSafetyHeatingType);
			$("#claSafetyMaxTemp").html(response.vesseldata[0].claSafetyMaxTemp);
			$("#claSafetyMinTemp").html(response.vesseldata[0].claSafetyMinTemp);
			$("#claSafetyCoats").html(response.vesseldata[0].claSafetyCoats);
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Safety</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaCasualties() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaCasualties2();
}
function triggerClaCasualties2() {	
	var phpWithArg = "query_vessel_details.php?source=claCasualties&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);

	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			for(var i=0;i<response.vesseldata.length;i++){
				// build HTML code
				if (i<1) {
					$(".mainPanel").append(
					'<div class="subtitle">Casualties</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Name (at time)</div>' +
							'<div class="fourColsLabel">Call Sign (at time)</div>' +
							'<div class="fourColsLabel">Vessel Type</div>' +
							'<div class="fourColsLabel">Built</div>' +
							'<div class="fourColsLabel">Status (at time)</div>' +
							'<div class="fourColsLabel">Flag (at time)</div>' +
							'<div class="fourColsLabel">Owner (at time)</div>' +
							'<div class="fourColsLabel">Class (at time)</div>' +
							'<div class="fourColsLabel">GT (tons)</div>' +
							'<div class="fourColsLabel">DWT (tons)</div>' +
							'<div class="fourColsLabel">Propulsion Type</div>' +			
							'<div class="fourColsLabel">Starting Port</div>' +
							'<div class="fourColsLabel">Voyage From</div>' +
							'<div class="fourColsLabel">Voyage To</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCasName' + i + '"></div>' +
							'<div id="claCasCallSign' + i + '"></div>' +
							'<div id="claCasType' + i + '"></div>' +
							'<div id="claCasBuild' + i + '"></div>' +
							'<div id="claCasStatus' + i + '"></div>' +
							'<div id="claCasFlag' + i + '"></div>' +
							'<div id="claCasOwner' + i + '"></div>' +
							'<div id="claCasClass' + i + '"></div>' +
							'<div id="claCasGt' + i + '"></div>' +
							'<div id="claCasDwt' + i + '"></div>' +
							'<div id="claCasPropulsion' + i + '"></div>' +							
							'<div id="claCasPort' + i + '"></div>' +
							'<div id="claCasVoyStart' + i + '"></div>' +
							'<div id="claCasVoyEnd' + i + '"></div>' +							
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Environment/Location</div>' +
							'<div class="fourColsLabel">Latitude</div>' +
							'<div class="fourColsLabel">Longitude</div>' +	
							'<div class="fourColsLabel">Start Date</div>' +
							'<div class="fourColsLabel">First Reported</div>' +
							'<div class="fourColsLabel">Severity Indicator</div>' +
							'<div class="fourColsLabel">Casualty Grouping</div>' +
							'<div class="fourColsLabel">Marsden Grid Start</div>' +
							'<div class="fourColsLabel">Marsden Grid End</div>' +
							'<div class="fourColsLabel">SIS Zone</div>' +
							'<div class="fourColsLabel">Pollution</div>' +
							'<div class="fourColsLabel">Killed</div>' +
							'<div class="fourColsLabel">Missing</div>' +
							'<div class="fourColsLabel">Cargo</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCasLocation' + i + '"></div>' +
							'<div id="claCasLat' + i + '"></div>' +
							'<div id="claCasLon' + i + '"></div>' +
							'<div id="claCasDateStart' + i + '"></div>' +
							'<div id="claCasDateReported' + i + '"></div>' +
							'<div id="claCasSeverity' + i + '"></div>' +
							'<div id="claCasCasualty' + i + '"></div>' +
							'<div id="claCasMarsdenStart' + i + '"></div>' +
							'<div id="claCasMarsdenEnd' + i + '"></div>' +
							'<div id="claCasSisZone' + i + '"></div>' +
							'<div id="claCasPollution' + i + '"></div>' +
							'<div id="claCasKilled' + i + '"></div>' +
							'<div id="claCasMissing' + i + '"></div>' +
							'<div id="claCasCargo' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="twoColsContainer">' +
						'<div class="twoColsInner">' +
							'<div class="fourColsLabel">Report 1</div>' +
						'</div>' +
						'<div class="twoColsOuter">' + 
							'<div id="claCasReport1' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="twoColsContainer">' +
						'<div class="twoColsInner">' +
							'<div class="fourColsLabel">Report 2</div>' +
						'</div>' +
						'<div class="twoColsOuter">' + 
							'<div id="claCasReport2' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div><hr></div>'
					);
				} else {
					$(".mainPanel").append(
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Name (at time)</div>' +
							'<div class="fourColsLabel">Call Sign (at time)</div>' +
							'<div class="fourColsLabel">Vessel Type</div>' +
							'<div class="fourColsLabel">Built</div>' +
							'<div class="fourColsLabel">Status (at time)</div>' +
							'<div class="fourColsLabel">Flag (at time)</div>' +
							'<div class="fourColsLabel">Owner (at time)</div>' +
							'<div class="fourColsLabel">Class (at time)</div>' +
							'<div class="fourColsLabel">GT (tons)</div>' +
							'<div class="fourColsLabel">DWT (tons)</div>' +
							'<div class="fourColsLabel">Propulsion Type</div>' +			
							'<div class="fourColsLabel">Starting Port</div>' +
							'<div class="fourColsLabel">Voyage From</div>' +
							'<div class="fourColsLabel">Voyage To</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCasName' + i + '"></div>' +
							'<div id="claCasCallSign' + i + '"></div>' +
							'<div id="claCasType' + i + '"></div>' +
							'<div id="claCasBuild' + i + '"></div>' +
							'<div id="claCasStatus' + i + '"></div>' +
							'<div id="claCasFlag' + i + '"></div>' +
							'<div id="claCasOwner' + i + '"></div>' +
							'<div id="claCasClass' + i + '"></div>' +
							'<div id="claCasGt' + i + '"></div>' +
							'<div id="claCasDwt' + i + '"></div>' +
							'<div id="claCasPropulsion' + i + '"></div>' +							
							'<div id="claCasPort' + i + '"></div>' +
							'<div id="claCasVoyStart' + i + '"></div>' +
							'<div id="claCasVoyEnd' + i + '"></div>' +							
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Environment/Location</div>' +
							'<div class="fourColsLabel">Latitude</div>' +
							'<div class="fourColsLabel">Longitude</div>' +	
							'<div class="fourColsLabel">Start Date</div>' +
							'<div class="fourColsLabel">First Reported</div>' +
							'<div class="fourColsLabel">Severity Indicator</div>' +
							'<div class="fourColsLabel">Casualty Grouping</div>' +
							'<div class="fourColsLabel">Marsden Grid Start</div>' +
							'<div class="fourColsLabel">Marsden Grid End</div>' +
							'<div class="fourColsLabel">SIS Zone</div>' +
							'<div class="fourColsLabel">Pollution</div>' +
							'<div class="fourColsLabel">Killed</div>' +
							'<div class="fourColsLabel">Missing</div>' +
							'<div class="fourColsLabel">Cargo</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCasLocation' + i + '"></div>' +
							'<div id="claCasLat' + i + '"></div>' +
							'<div id="claCasLon' + i + '"></div>' +
							'<div id="claCasDateStart' + i + '"></div>' +
							'<div id="claCasDateReported' + i + '"></div>' +
							'<div id="claCasSeverity' + i + '"></div>' +
							'<div id="claCasCasualty' + i + '"></div>' +
							'<div id="claCasMarsdenStart' + i + '"></div>' +
							'<div id="claCasMarsdenEnd' + i + '"></div>' +
							'<div id="claCasSisZone' + i + '"></div>' +
							'<div id="claCasPollution' + i + '"></div>' +
							'<div id="claCasKilled' + i + '"></div>' +
							'<div id="claCasMissing' + i + '"></div>' +
							'<div id="claCasCargo' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="twoColsContainer">' +
						'<div class="twoColsInner">' +
							'<div class="fourColsLabel">Report 1</div>' +
						'</div>' +
						'<div class="twoColsOuter">' + 
							'<div id="claCasReport1' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div class="twoColsContainer">' +
						'<div class="twoColsInner">' +
							'<div class="fourColsLabel">Report 2</div>' +
						'</div>' +
						'<div class="twoColsOuter">' + 
							'<div id="claCasReport2' + i + '"></div>' +
						'</div>' +
					'</div>' +
					'<div><hr></div>'
					);
				}
				
				// format data; remove NULL strings
				response.vesseldata[i].claCasName = checkNullField(response.vesseldata[i].claCasName);
				response.vesseldata[i].claCasCallSign = checkNullField(response.vesseldata[i].claCasCallSign);

				var claCasType = response.vesseldata[i].claCasTypeA;
				claCasType += ', ' + response.vesseldata[i].claCasTypeB;
				
				response.vesseldata[i].claCasBuild = checkNullField(response.vesseldata[i].claCasBuild);
				response.vesseldata[i].claCasStatus = checkNullField(response.vesseldata[i].claCasStatus);
				response.vesseldata[i].claCasFlag = checkNullField(response.vesseldata[i].claCasFlag);
				response.vesseldata[i].claCasOwner = checkNullField(response.vesseldata[i].claCasOwner);

				var claCasClass = response.vesseldata[i].claCasClass1;
				if (claCasClass) {
					if (response.vesseldata[i].claCasClass2) {
						claCasClass += ', ' + response.vesseldata[i].claCasClass2;
					}
				} else {
					claCasClass = 'N/A';
				}
				
				response.vesseldata[i].claCasGt = checkNullField(response.vesseldata[i].claCasGt);
				response.vesseldata[i].claCasDwt = checkNullField(response.vesseldata[i].claCasDwt);
				response.vesseldata[i].claCasPropulsion = checkNullField(response.vesseldata[i].claCasPropulsion);
				response.vesseldata[i].claCasLocation = checkNullField(response.vesseldata[i].claCasLocation);
				
				var claCasPort = response.vesseldata[i].claCasPort1;
				if (claCasPort) {
					if(response.vesseldata[i].claCasPort2) {
						claCasPort += ', ' + response.vesseldata[i].claCasPort2;
					} 
				} else {
					claCasPort = response.vesseldata[i].claCasPort2;
				}
				
				response.vesseldata[i].claCasVoyStart = checkNullField(response.vesseldata[i].claCasVoyStart);
				response.vesseldata[i].claCasVoyEnd = checkNullField(response.vesseldata[i].claCasVoyEnd);
				
				var claCasLat = response.vesseldata[i].claCasLatDeg;
				if (claCasLat) {
					claCasLat += '&deg;' + response.vesseldata[i].claCasLatMin + "'" + response.vesseldata[i].claCasLatSec + '"' + response.vesseldata[i].claCasLatDir; 
				} else {
					claCasLat = 'N/A';
				}
				
				var claCasLon = response.vesseldata[i].claCasLonDeg;
				if (claCasLon) {
					claCasLon += '&deg;' + response.vesseldata[i].claCasLonMin + "'" + response.vesseldata[i].claCasLonSec + '"' + response.vesseldata[i].claCasLonDir; 
				} else {
					claCasLon = 'N/A';
				}
				
				response.vesseldata[i].claCasDateStart = checkNullField(response.vesseldata[i].claCasDateStart);
				response.vesseldata[i].claCasDateReported = checkNullField(response.vesseldata[i].claCasDateReported);
				response.vesseldata[i].claCasSeverity = checkNullField(response.vesseldata[i].claCasSeverity);
				response.vesseldata[i].claCasCasualty = checkNullField(response.vesseldata[i].claCasCasualty);
				response.vesseldata[i].claCasMarsdenStart = checkNullField(response.vesseldata[i].claCasMarsdenStart);
				response.vesseldata[i].claCasMarsdenEnd = checkNullField(response.vesseldata[i].claCasMarsdenEnd);
				response.vesseldata[i].claCasSisZone = checkNullField(response.vesseldata[i].claCasSisZone);
				response.vesseldata[i].claCasReport1 = checkNullField(response.vesseldata[i].claCasReport1);
				response.vesseldata[i].claCasReport2 = checkNullField(response.vesseldata[i].claCasReport2);
				
				var claCasPollution = response.vesseldata[i].claCasPollInd;
				if (claCasPollution != 'N') {
					claCasPollution = 'Yes';
					if (response.vesseldata[i].claCasPollType) {
						claCasPollution += ', Type: ' + response.vesseldata[i].claCasPollType;
						if (response.vesseldata[i].claCasPollUnit) {
							claCasPollution += ', Units: ' + response.vesseldata[i].claCasPollUnit;
							if (response.vesseldata[i].claCasPollQty) {							
								claCasPollution += ', Quantity: ' + claCasPollQty;
							}
						}
					}
				} else {
					claCasPollution = 'No';
				}
				
				var claCasKilled = response.vesseldata[i].claCasKillInd;
				if (claCasKilled != 'N') {	
					claCasKilled = 'Yes';
					if (response.vesseldata[i].claCasKillNo) {
						claCasKilled += ', ' + response.vesseldata[i].claCasKillNo + ' killed';
						if (response.vesseldata[i].claCasKillDate) {
							claCasKilled += ', Date: ' + response.vesseldata[i].claCasKillDate;
						}
					}
				} else {
					claCasKilled = 'No';
				}
				
				var claCasMissing = response.vesseldata[i].claCasMissingInd;
				if (claCasMissing != 'N') {
					claCasMissing = 'Yes';
					if (response.vesseldata[i].claCasMissingNo) {
						claCasMissing += ', ' + response.vesseldata[i].claCasMissingNo + ' missing';
					}
				} else {
					claCasMissing = 'No';
				}
				
				var claCasCargo = response.vesseldata[i].claCasCargoStatus;
				if (response.vesseldata[i].claCasCargoText) {
					claCasCargo += ", " + response.vesseldata[i].claCasCargoText;
				}
				
				// display data
				$("#claCasName"+i).html(response.vesseldata[i].claCasName);
				$("#claCasCallSign"+i).html(response.vesseldata[i].claCasCallSign);
				$("#claCasType"+i).html(claCasType);
				$("#claCasBuild"+i).html(response.vesseldata[i].claCasBuild);
				$("#claCasStatus"+i).html(response.vesseldata[i].claCasStatus);
				$("#claCasFlag"+i).html(response.vesseldata[i].claCasFlag);
				$("#claCasOwner"+i).html(response.vesseldata[i].claCasOwner);
				$("#claCasClass"+i).html(claCasClass);
				$("#claCasGt"+i).html(response.vesseldata[i].claCasGt);
				$("#claCasDwt"+i).html(response.vesseldata[i].claCasDwt);
				$("#claCasPropulsion"+i).html(response.vesseldata[i].claCasPropulsion);
				$("#claCasLocation"+i).html(response.vesseldata[i].claCasLocation);
				$("#claCasPort"+i).html(claCasPort);
				$("#claCasVoyStart"+i).html(response.vesseldata[i].claCasVoyStart);
				$("#claCasVoyEnd"+i).html(response.vesseldata[i].claCasVoyEnd);
				$("#claCasLat"+i).html(claCasLat);
				$("#claCasLon"+i).html(claCasLon);
				$("#claCasDateStart"+i).html(response.vesseldata[i].claCasDateStart);
				$("#claCasDateReported"+i).html(response.vesseldata[i].claCasDateReported);
				$("#claCasSeverity"+i).html(response.vesseldata[i].claCasSeverity);
				$("#claCasCasualty"+i).html(response.vesseldata[i].claCasCasualty);
				$("#claCasMarsdenStart"+i).html(response.vesseldata[i].claCasMarsdenStart);
				$("#claCasMarsdenEnd"+i).html(response.vesseldata[i].claCasMarsdenEnd);
				$("#claCasSisZone"+i).html(response.vesseldata[i].claCasSisZone);
				$("#claCasReport1"+i).html(response.vesseldata[i].claCasReport1);
				$("#claCasReport2"+i).html(response.vesseldata[i].claCasReport2);
				$("#claCasPollution"+i).html(claCasPollution);
				$("#claCasKilled"+i).html(claCasKilled);
				$("#claCasMissing"+i).html(claCasMissing);
				$("#claCasCargo"+i).html(claCasCargo);
			}		
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Casualties</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaCrew() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaCrew2();
}
function triggerClaCrew2() {
	var phpWithArg = "query_vessel_details.php?source=claCrew&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			for(var i=0;i<response.vesseldata.length;i++){
				// build HTML code
				if (i<1) {
					$(".mainPanel").append(
					'<div class="subtitle">Crew List</div>' +
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">ID</div>' +
							'<div class="fourColsLabel">List Date</div>' +
							'<div class="fourColsLabel">Nationality</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCrewId' + i + '"></div>' +
							'<div id="claCrewDate' + i + '"></div>' +
							'<div id="claCrewNationality' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Total Crew</div>' +
							'<div class="fourColsLabel">Total Officers</div>' +
							'<div class="fourColsLabel">Total Ratings</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCrewTotal' + i + '"></div>' +
							'<div id="claCrewOfficers' + i + '"></div>' +
							'<div id="claCrewRatings' + i + '"></div>' +
						'</div>' +
					'</div><div><hr></div>'
					);
				} else {
					$(".mainPanel").append(
					'<div class="fourColsContainer">' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">ID</div>' +
							'<div class="fourColsLabel">List Date</div>' +
							'<div class="fourColsLabel">Nationality</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCrewId' + i + '"></div>' +
							'<div id="claCrewDate' + i + '"></div>' +
							'<div id="claCrewNationality' + i + '"></div>' +
						'</div>' +
						'<div class="fourColsInner">' +
							'<div class="fourColsLabel">Total Crew</div>' +
							'<div class="fourColsLabel">Total Officers</div>' +
							'<div class="fourColsLabel">Total Ratings</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claCrewTotal' + i + '"></div>' +
							'<div id="claCrewOfficers' + i + '"></div>' +
							'<div id="claCrewRatings' + i + '"></div>' +
						'</div>' +
					'</div><div><hr></div>'
					);
				}
				
				// format data; remove NULL strings
				response.vesseldata[i].claCrewId = checkNullField(response.vesseldata[i].claCrewId);
				response.vesseldata[i].claCrewDate = checkNullField(response.vesseldata[i].claCrewDate);
				response.vesseldata[i].claCrewNationality = checkNullField(response.vesseldata[i].claCrewNationality);
				response.vesseldata[i].calCrewTotal = checkNullField(response.vesseldata[i].calCrewTotal);
				response.vesseldata[i].claCrewOfficers = checkNullField(response.vesseldata[i].claCrewOfficers);
				response.vesseldata[i].claCrewRatings = checkNullField(response.vesseldata[i].claCrewRatings);
				
				// display data
				$("#claCrewId"+i).html(response.vesseldata[i].claCrewId);
				$("#claCrewDate"+i).html(response.vesseldata[i].claCrewDate);
				$("#claCrewNationality"+i).html(response.vesseldata[i].claCrewNationality);
				$("#calCrewTotal"+i).html(response.vesseldata[i].calCrewTotal);
				$("#claCrewOfficers"+i).html(response.vesseldata[i].claCrewOfficers);
				$("#claCrewRatings"+i).html(response.vesseldata[i].claCrewRatings);	
			}		
		} else {
			$(".mainPanel").append(
			'<div class="subtitle">Crew List</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaViewAll() {
	if(checkImo()){return;};
	
	createClassifiedTitle();
	triggerClaInspections2();
	triggerClaCertificates2();
	triggerClaSafety2();
	triggerClaCasualties2();
	triggerClaCrew2();
}

// Get information from database and show Event Timeline info in main panel
function triggerEventTimeline() {
	if(checkImo()){ return; };
	
	// retrieve info from database
	var phpWithArg = "query_vessel_details.php?source=eventTimeline&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);

		if (response.resultcount > 0) {
			var timDateArr = new Array(8+response.vesseldata.length);	
			var timDescArr = new Array(8+response.vesseldata.length);	
			var timHtmlArr = new Array(8+response.vesseldata.length);	
			timDateArr[0] = ((response.vesseldata[0].dateLastUpdate).split(" "))[0];
			timDateArr[1] = ((response.vesseldata[0].dateContract).split(" "))[0];
			timDateArr[2] = ((response.vesseldata[0].dateKeelLaid).split(" "))[0];
			timDateArr[3] = ((response.vesseldata[0].dateDueOrDelivered).split(" "))[0];
			timDateArr[4] = ((response.vesseldata[0].dateAcquired).split(" "))[0];
			timDateArr[5] = ((response.vesseldata[0].dateLaunched).split(" "))[0];
			timDateArr[6] = ((response.vesseldata[0].dateConversion).split(" "))[0];
			timDateArr[7] = ((response.vesseldata[0].dateScrapOrLoss).split(" "))[0];
			timDateArr[8] = ((response.vesseldata[0].dateRecommissioned).split(" "))[0];
			timDescArr[0] = "Last Updated";
			timDescArr[1] = "Contracted";
			timDescArr[2] = "Keel Laid"; 
			timDescArr[3] = "Due or Delivered"; 
			timDescArr[4] = "Acquired"; 
			timDescArr[5] = "Launched"; 
			timDescArr[6] = "Conversion"; 
			timDescArr[7] = "Scrap or Loss"; 
			timDescArr[8] = "Recommissioned"; 
			timHtmlArr[0] = 'timLastUpdated';
			timHtmlArr[1] = 'timContracted';
			timHtmlArr[2] = 'timKeelLaid';
			timHtmlArr[3] = 'timDueOrDelivered';
			timHtmlArr[4] = 'timAcquired';
			timHtmlArr[5] = 'timLaunched';
			timHtmlArr[6] = 'timConversion';
			timHtmlArr[7] = 'timScrapOrLoss';
			timHtmlArr[8] = 'timRecommissioned';

			// check for at least one inspection record
			if (response.resultcount > 1) { 
		
				// holds all inspection records
				var inspDateArr = new Array(response.vesseldata.length-1); 
				var inspDescArr = new Array(response.vesseldata.length-1); 
				var inspHtmlArr = new Array(response.vesseldata.length-1); 
				
				// create an array to store all inspection records
				for (var i=1;i<response.vesseldata.length;i++) {
					inspDateArr[i-1] = ((response.vesseldata[i].dateLastUpdate).split(" "))[0];
					inspDescArr[i-1] = "";
					inspHtmlArr[i-1] = "";
					
					if (response.vesseldata[i].dateContract) {
						inspDescArr[i-1] += "ID " + response.vesseldata[i].dateContract;
					}
					if (response.vesseldata[i].dateKeelLaid) {
						inspDescArr[i-1] += ": Inspected by " + response.vesseldata[i].dateKeelLaid;
					}
					if (response.vesseldata[i].dateDueOrDelivered) {
						inspDescArr[i-1] += " in " + response.vesseldata[i].dateDueOrDelivered;
					}
					if (response.vesseldata[i].dateAcquired) {
						inspDescArr[i-1] += ", " + response.vesseldata[i].dateAcquired;				
					}
					if (response.vesseldata[i].dateLaunched !=0) {
						inspDescArr[i-1] += ", " + response.vesseldata[i].dateLaunched + " defects found";
					}
					if (response.vesseldata[i].dateConversion != 0) {
						inspDescArr[i-1] += ", vessel detained"
					}
					
					inspHtmlArr[i-1] += 'timInspection' + [i];
				}		

				for (var i=0;i<inspDateArr.length;i++) {
					timDateArr[8+i] = inspDateArr[i];
					timDescArr[8+i] = inspDescArr[i];
					timHtmlArr[8+i] = inspHtmlArr[i];
				}
			}	

			// contains all timeline events
			var timArr = new Array(timDateArr.length);
			for (var i=0;i<timDateArr.length;i++) {
				timArr[i] = new Array(3);
			}
			for (var i=0;i<timDateArr.length;i++) {
				timArr[i][0] = timDateArr[i];
				timArr[i][1] = timDescArr[i];
				timArr[i][2] = timHtmlArr[i];
			}

			// sort dates
			// order dates in ascending order
			timArr.sort(
				(function(index) {
					return function(a,b) {
						// convert null values to blank strings
						var va = (a[index] === null) ? "" : "" + a,
						    vb = (b[index] === null) ? "" : "" + b;
						// return string comparison result
						return (va === vb ? 0 : (va < vb ? -1 : 1));
					};
				})(0) // sort by index 0
			);
			
			// order dates in descending order
			timArr.reverse();
			
			// build HTML code
			$(".mainPanel").html(
			'<div class="title">Event Timeline</div>'	+
			'<div class="timelineColsContainer">' +
				'<div class="timelineColLeft">' +
					'<div class="subtitle">Date</div>' +
				'</div>' +
				'<div class="timelineColRight">' +
					'<div class="subtitle">Significant Event</div>' +
				'</div>' +
			'</div>' 
			);

			for (var i=0;i<timArr.length;i++) {
				if (timArr[i][0]) {
					$(".mainPanel").append(
					'<div class="timelineColsContainer">' +
						'<div class="timelineColLeft">' +
							'<div>' + timArr[i][0] + '</div>' +
						'</div>' +
						'<div class="timelineColRight" style="font-weight:normal;">' +
							'<div id="' + timArr[i][2] + '"></div>' +
						'</div>' +
					'</div>'	
					);
				}
			}
			
			// display data
			for (var i=0;i<timArr.length;i++){
				$("#"+timArr[i][2]).html(timArr[i][1]);
			}
		
		} else {
			$(".mainPanel").html(
			'<div class="title">Event Timeline</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}
		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Ship Performance info in main panel
function triggerPerformance() {
	if(checkImo()){return;};
	
	
	
	var phpWithArg = "query_vessel_details.php?source=performance&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// build HTML code
			$(".mainPanel").html(
				'<div class="title">Ship Performance</div>' +
				'<div class="subtitle">Ship Performance</div>' +
				'<div class="fourColsContainer">' +
					'<div class="fourColsInner">' +
						'<div class="fourColsLabel">Bollard Pull</div>' +
						'<div class="fourColsLabel">Consumption Speed (tonnes)</div>' +
						'<div class="fourColsLabel">MDO (tonnes)</div>' +
						'<div class="fourColsLabel">HFO (tonnes)</div>' +
					'</div>' +
					'<div class="fourColsOuter">' +
						'<div id="perBollard"></div>' +
						'<div id="perMdo"></div>' +
						'<div id="perHfo"></div>' +
						'<div id="perSpeed"></div>' +
					'</div>' + 
				'</div>' +
				'<div>&nbsp;</div>' +
				'<div style="font-size:x-small;">MDO = medium diesel oil consumed, HFO = Heavy fuel oil consumed</div>'
			);
	
			// format data; remove NULL strings
			response.vesseldata[0].perBollard = checkNullField(response.vesseldata[0].perBollard);
			response.vesseldata[0].perMdo = checkNullField(response.vesseldata[0].perMdo);
			response.vesseldata[0].perHfo = checkNullField(response.vesseldata[0].perHfo);
			response.vesseldata[0].perSpeed = checkNullField(response.vesseldata[0].perSpeed);
			
			// display data
			$("#perBollard").html(response.vesseldata[0].perBollard);
			console.log(response.vesseldata[0].perBollard);
			$("#perMdo").html(response.vesseldata[0].perMdo);
			$("#perHfo").html(response.vesseldata[0].perHfo);
			$("#perSpeed").html(response.vesseldata[0].perSpeed);
		} else {
			$(".mainPanel").html(
			'<div class="subtitle">Performance</div>' +
			'<div style="color:red;font-weight:bold;">No results found.</div>'
			);
		}	
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Checks for null fields and replaces it with a placeholder
function checkNullField(field) {
	if(!field) {
		return "N/A";
	}
	return field;
}

// Launch Maps Widget
function launchOwfMaps() {
	OWF.Launcher.launch({
		universealName: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		guid: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		title: 'ICODE-MDA Maps',
		launchOnlyIfClosed: true
	}, callback);
}
function callback(){
}


// PROTOTYPES	
function fxnName() {
	$(".mainPanel").html(
		'<div class="title"></div>'	+
		'<div class="subtitle"></div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}	
function headSection() {
	$(".mainPanel").html(
		'<div class="title"></div>'	
	);
}
function subSection() {
	$(".mainPanel").append(
		'<div class="subtitle"></div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}	



/*
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// format data; remove NULL strings
			if(!response.vesseldata[0].){
				response.vesseldata[0]. = "N/A";
			}
		
			// display data
			$("#").html(response.vesseldata[0].);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
*/