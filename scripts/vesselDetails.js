/**
 * @name vesselDetails.js
 * @author Julie Luu
 * @fileoverview
 * Script to handle retrieval and display of detailed vessel information
 */
 
 // global variables
 var imo = "";
 
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
	/*
	$(".mainPanel").html(
		'<div class="title">Search Results</div>' +
		'<div>Returned the following search results...</div>'
	);
	*/
	
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
				'<div style="color:red;font-weight:bold;"Invalid MMSI entered.</div>'
			);
			return;
		}
	}
	
	initialize(true,searchType,searchTerm);
}

// Get information from database and show Initial info in main panel
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
		
			if (response.resultcount > 0) {
				for(var i=0; i<response.vesseldata.length; i++) {
					var shipName = response.vesseldata[i].shipName;
					var dimo = response.vesseldata[i].imo;
					var callSign = response.vesseldata[i].callSign;
					var mmsi = response.vesseldata[i].mmsi;
					var flag = response.vesseldata[i].flag;
					var operator = response.vesseldata[i].operator;
					var shipType = response.vesseldata[i].shipType;
					var gross = response.vesseldata[i].gross;
					var deadweight = response.vesseldata[i].deadweight;
					var dateOfBuild = response.vesseldata[i].dateOfBuild;
					var shipStatus = response.vesseldata[i].shipStatus;
					var shipBuilder = response.vesseldata[i].shipBuilder;
				}
				imo = dimo;
				$(".mainPanel").html('');
				$("#detailShipName").html(shipName);
				$("#detailImo").html(dimo);
				$("#detailCallSign").html(callSign);
				$("#detailMmsi").html(mmsi);
				$("#detailFlag").html(flag);
				$("#detailOperator").html(operator);
				$("#detailShiptype").html(shipType);
				$("#detailGross").html(gross);
				$("#detailDeadweight").html(deadweight);
				$("#detailDateOfBuild").html(dateOfBuild);
				$("#detailShipStatus").html(shipStatus);
				$("#detailShipbuilder").html(shipBuilder);
			} else {
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
	if(checkImo()){
		return;
	};
	
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
			// format data; remove NULL strings
			if(!response.vesseldata[0].regPortOfRegistry){
				response.vesseldata[0].regPortOfRegistry = "N/A";
			}
			if(!response.vesseldata[0].regOfficialNumber){
				response.vesseldata[0].regOfficialNumber = "N/A";
			}
			if(!response.vesseldata[0].regFishingNumber){
				response.vesseldata[0].regFishingNumber = "N/A";
			}
			if(!response.vesseldata[0].regSatComAnsbkCode){
				response.vesseldata[0].regSatComAnsbkCode = "N/A";
			}
			if(!response.vesseldata[0].regFlag){
				response.vesseldata[0].regFlag = "N/A";
			}
			if(!response.vesseldata[0].regSatCom){
				response.vesseldata[0].regSatCom = "N/A";
			}
			if(!response.vesseldata[0].regPandiId){
				response.vesseldata[0].regPandiId = "N/A";
			}
			if(!response.vesseldata[0].regPandiClub){
				response.vesseldata[0].regPandiClub = "N/A";
			}
		
			// display data
			$("#regPortOfRegistry").html(response.vesseldata[0].regPortOfRegistry);
			$("#regOfficialNumber").html(response.vesseldata[0].regOfficialNumber);
			$("#regSatComAnsBack").html(response.vesseldata[0].regSatComAnsbkCode);
			$("#regSatComId").html(response.vesseldata[0].regSatCom);
			$("#regFlag").html(response.vesseldata[0].regFlag);
			$("#regFishingNumber").html(response.vesseldata[0].regFishingNumber);
			$("#regPandiClubId").html(response.vesseldata[0].regPandiId);
			$("#regPandiClub").html(response.vesseldata[0].regPandiClub);
		}
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Ownership info in main panel
function triggerOwnership() {
	if(checkImo()){
		return;
	};
	
	// build HTML code
	$(".mainPanel").html(
		'<div class="title">Ownership</div>' +
		'<div class="subtitle">Ownership</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Group Owner</div>' +
				'<div class="fourColsLabel">Ship Manager</div>' +
				'<div class="fourColsLabel">Operator</div>' +
				'<div class="fourColsLabel">DOC Company</div>' +
				'<div class="fourColsLabel">Registered Owner</div>' +
				'<div class="fourColsLabel">Technical Manager</div>' +
				'<div class="fourColsLabel">IMO Company No (DOC)</div>' +
				'<div class="fourColsLabel">IMO Registered Owner No</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="ownershipGroupOwner"></div>' +
				'<div id="ownershipShipManager"></div>' +
				'<div id="ownershipOperator"></div>' +
				'<div id="ownershipDocCompany"></div>' +
				'<div id="ownershipRegisteredOwner"></div>' +
				'<div id="ownershipTechnicalManager"></div>' +
				'<div id="ownershipImoCompanyNo"></div>' +
				'<div id="ownershipImoRegisteredOwnerNo"></div>' +
			'</div>' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="ownershipGroupOwnerLocation"></div>' +
				'<div id="ownershipShipManagerLocation"></div>' +
				'<div id="ownershipOperatorLocation"></div>' +
				'<div id="ownershipDocCompanyLocation"></div>' +
				'<div id="ownershipRegisteredOwnerLocation"></div>' +
				'<div id="ownershipTechnicalManagerLocation"></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
	
	var phpWithArg = "query_vessel_details.php?source=ownership&imo=" + imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	// retrieve info from database using query request parameters
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Vessels Detail: ' + response.query);
		
		if (response.resultcount > 0) {
			// format data; remove NULL strings
			if(!response.vesseldata[0].ownOwner){
				response.vesseldata[0].ownOwner
			}
			if(!response.vesseldata[0].ownManager){
				response.vesseldata[0].ownManager
			}
			if(!response.vesseldata[0].ownOperator){
				response.vesseldata[0].ownOperator
			}
			if(!response.vesseldata[0].ownDoc){
				response.vesseldata[0].ownDoc
			}
			if(!response.vesseldata[0].ownRegisteredOwner){
				response.vesseldata[0].ownRegisteredOwner
			}
			if(!response.vesseldata[0].ownTechnicalManager){
				response.vesseldata[0].ownTechnicalManager
			}
			if(!response.vesseldata[0].ownDocId){
				response.vesseldata[0].ownDocId
			}
			if(!response.vesseldata[0].ownRegisteredOwnerId){
				response.vesseldata[0].ownRegisteredOwnerId
			}
			
			// display data
			$("#ownershipGroupOwner").html(response.vesseldata[0].ownOwner);
			$("#ownershipShipManager").html(response.vesseldata[0].ownManager);
			$("#ownershipOperator").html(response.vesseldata[0].ownOperator);
			$("#ownershipDocCompany").html(response.vesseldata[0].ownDoc);
			$("#ownershipRegisteredOwner").html(response.vesseldata[0].ownRegisteredOwner);
			$("#ownershipTechnicalManager").html(response.vesseldata[0].ownTechnicalManager);
			$("#ownershipImoCompanyNo").html(response.vesseldata[0].ownDocId);
			$("#ownershipImoRegisteredOwnerNo").html(response.vesseldata[0].ownRegisteredOwnerId);
		}	
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}

// Get information from database and show Commercial History info in main panel
function triggerCommercialHistory() {
	if(checkImo()){
		return;
	};
	
	// build HTML code
	$(".mainPanel").html(
		'<div class="title">Commercial History</div>' +
		'<div class="subtitle">Commercial History</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Date</div>' +
				'<div class="fourColsLabel">Name</div>' +
				'<div class="fourColsLabel">Flag</div>' +
				'<div class="fourColsLabel">Group Owner</div>' +
				'<div class="fourColsLabel">Operator</div>' +
				'<div class="fourColsLabel">Manager</div>' +
				'<div class="fourColsLabel">Registered Owner</div>' +
				'<div class="fourColsLabel">DOC</div>' +
				'<div class="fourColsLabel">Price</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="commDate"></div>' +
				'<div id="commName"></div>' +
				'<div id="commFlag"></div>' +
				'<div id="commGroupOwner"></div>' +
				'<div id="commOperator"></div>' +
				'<div id="commManager"></div>' +
				'<div id="commRegisteredOwner"></div>' +
				'<div id="commDoc"></div>' +
				'<div id="commPrice"></div>	' +			
			'</div>' +
		'</div>'
	);	
}

// Get information from database and show Class info in main panel
function triggerClass() {
	if(checkImo()){
		return;
	};
	
	// build HTML code
	$(".mainPanel").html(
		'<div class="title">Class</div>' +
		'<div class="subtitle">Class</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Class</div>' +
				'<div class="fourColsLabel">Class ID</div>' +
				'<div class="fourColsLabel">NK</div>' +
				'<div class="fourColsLabel">Survey Date</div>' +
				'<div class="fourColsLabel">Class Notation</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="clas"></div>' +
				'<div id="clasId"></div>' +
				'<div id="clasNk"></div>' +
				'<div id="clasSurveyDate"></div>' +
				'<div id="clasNotation"></div>' +
			'</div>' + 
		'</div>' +
		
		'<div>&nbsp;</div>' +
		
		'<div class="subtitle">Class History</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Date</div>' +
				'<div class="fourColsLabel">Class</div>' +
				'<div class="fourColsLabel">Status</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="clasDate"></div>' +
				'<div id="clas2"></div>' +
				'<div id="clasStatus"></div>' +
			'</div>' +
		'</div>'
	);
}

// Get information from database and show Survey info in main panel
function triggerSurveys() {
	if(checkImo()){
		return;
	};
	
	//build HTML code
	$(".mainPanel").html(
		'<div class="title">Surveys</div>' +
		'<div class="subtitle">Surveys</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
			'</div>' + 
		'</div>' +
		
		'<div>&nbsp;</div>' +
		
		'<div class="subtitle">Surveys</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Date</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="clasDate"></div>' +
			'</div>' +
		'</div>'
	);
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
				'<div id="conShipType"></div>' +
				'<div id="conBuilt"></div>' +
				'<div id="conGt"></div>' +
				'<div id="conDeadweight"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConShipbuilder() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConShipbuilder2();
}
function triggerConShipbuilder2() {
	$(".mainPanel").append(
		'<div class="subtitle">Shipbuilder</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Build Date</div>' +
				'<div class="fourColsLabel">Build Company</div>' +
				'<div class="fourColsLabel">Hull Number</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conBuildDate"></div>' +
				'<div id="conBuildCompany"></div>' +
				'<div id="conHullNumber"></div>' +
			'</div>' +
		'</div>'
	);	
}
function triggerConStatus() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConStatus2();
}
function triggerConStatus2() {
	$(".mainPanel").append(
		'<div class="subtitle">Status</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Status</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conStatus"></div>' +
			'</div>' +
		'</div>'
	);	
}	
function triggerConConstructionDetail() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConConstructionDetail2();
}
function triggerConConstructionDetail2() {
	$(".mainPanel").append(
		'<div class="subtitle">Construction Detail</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Statcode5</div>' +
				'<div class="fourColsLabel">Standard Design</div>' +
				'<div class="fourColsLabel">Ship Type Group</div>' +
				'<div class="fourColsLabel">Hull Material</div>' +
				'<div class="fourColsLabel">Strengthed for Heavy Cargo</div>' +
				'<div class="fourColsLabel">Hull Connections</div>' +
				'<div class="fourColsLabel">Deck</div>' +
				'<div class="fourColsLabel">Bulbous Bow</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conStatcode5"></div>' +
				'<div id="conStandardDesign"></div>' +
				'<div id="conShipTypeGroup"></div>' +
				'<div id="conHullMaterial"></div>' +
				'<div id="conHeavyCargoStrengthed"></div>' +
				'<div id="conHullConnections"></div>' +
				'<div id="conDeck"></div>' +
				'<div id="conBulbousBow"></div>' +
			'</div>' +
		'</div>'
	);
}	
function triggerConServiceConstraints() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConServiceConstraints2();
}
function triggerConServiceConstraints2() {
	$(".mainPanel").append(
		'<div class="subtitle">Service Constraints</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}	
function triggerConAlterations() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConAlterations2();
}
function triggerConAlterations2() {
	$(".mainPanel").append(
		'<div class="subtitle">Alterations</div>' +
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
function triggerConDimensions() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConDimensions2();
}	
function triggerConDimensions2() {
	$(".mainPanel").append(
		'<div class="subtitle">Dimensions</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Length Overall</div>' +
				'<div class="fourColsLabel">Length (Reg)</div>' +
				'<div class="fourColsLabel">Breadth Extreme</div>' +
				'<div class="fourColsLabel">Draught</div>' +
				'<div class="fourColsLabel">Height</div>' +
				'<div class="fourColsLabel">Displacement</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conLengthOverall"></div>' +
				'<div id="conLengthReg"></div>' +
				'<div id="conBreadthExtreme"></div>' +
				'<div id="conDraught"></div>' +
				'<div id="conHeight"></div>' +
				'<div id="conDisplacement"></div>' +
			'</div>' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Length (BP)</div>' +
				'<div class="fourColsLabel">Bulbous Bow</div>' +
				'<div class="fourColsLabel">Breadth Moulded</div>' +
				'<div class="fourColsLabel">Depth</div>' +
				'<div class="fourColsLabel">&nbsp;</div>' +
				'<div class="fourColsLabel">T/CM</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conLengthBp"></div>' +
				'<div id="conBulbousBow"></div>' +
				'<div id="conBreadthMoulded"></div>' +
				'<div id="conDepth"></div>' +
				'<div>&nbsp;</div>' +
				'<div id="conTcm"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConTonnages() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConTonnages2();	
}	
function triggerConTonnages2() {
	$(".mainPanel").append(
		'<div class="subtitle">Tonnages</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Tonnage Type</div>' +
				'<div class="fourColsLabel">Effective Date</div>' +
				'<div class="fourColsLabel">Gross Tonnage (GT)</div>' +
				'<div class="fourColsLabel">Deadweight (DWT)</div>' +
				'<div class="fourColsLabel">Formula Deadweight</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conTonnageType"></div>' +
				'<div id="conEffectiveDate"></div>' +
				'<div id="conGrossTonnage"></div>' +
				'<div id="conDeadweight""></div>' +
				'<div id="conFormulaDeadweight"></div>' +
			'</div>' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Tonnage System</div>' +
				'<div class="fourColsLabel">Net Tonnage (NT)</div>' +
				'<div class="fourColsLabel">Compensated Gross Tonnage (CGT)</div>' +
				'<div class="fourColsLabel">Light Displacement Tonnage (LDT)</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="conTonnageSystem"></div>' +
				'<div id="conNetTonnage"></div>' +
				'<div id="conCompensatedGrossTonnage"></div>' +
				'<div id="conLightDisplacementTonnage"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConArrangement() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConArrangement2();	
}	
function triggerConArrangement2() {
	$(".mainPanel").append(
		'<div class="subtitle">Arrangement</div>' +
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
function triggerConSisterShips() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConSisterShips2();
}	
function triggerConSisterShips2() {
	$(".mainPanel").append(
		'<div class="subtitle">Sister Ships</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConSupplementaryFeatures() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConSupplementaryFeatures2();
}	
function triggerConSupplementaryFeatures2() {
	$(".mainPanel").append(
		'<div class="subtitle">Supplementary Features</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConViewAll() {
	if(checkImo()){
		return;
	};
	
	createConstructionTitle();
	triggerConOverview2();
	triggerConShipbuilder2();
	triggerConStatus2();
	triggerConConstructionDetail2();
	triggerConServiceConstraints2();
	triggerConAlterations2();
	triggerConDimensions2();
	triggerConTonnages2();
	triggerConArrangement2();
	triggerConSisterShips2();
	triggerConSupplementaryFeatures2();	
}	

// Get information from database and show Cargo and Gear info in main panel
function createCargoAndGearTitle() {
	$(".mainPanel").html(
		'<div class="title">Cargo & Gear</div>'		
	);
}
function triggerCngOverview() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngOverview2();
}
function triggerCngOverview2() {
	$(".mainPanel").append(
		'<div class="subtitle">Overview</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Grain</div>' +
				'<div class="fourColsLabel">Bale</div>' +
				'<div class="fourColsLabel">TEU</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="cngOverviewGrain"></div>' +
				'<div id="cngOverviewBale"></div>' +
				'<div id="cngOverviewTeu"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerCngCompartments() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngCompartments2();
}
function triggerCngCompartments2() {
	$(".mainPanel").append(
		'<div class="subtitle">Compartments</div>' +
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
function triggerCngTanks() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngTanks2();
}
function triggerCngTanks2() {
	$(".mainPanel").append(
		'<div class="subtitle">Tanks</div>' +
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
function triggerCngHatches() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngHatches2();
}
function triggerCngHatches2() {
	$(".mainPanel").append(
		'<div class="subtitle">Hatches</div>' +
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
function triggerCngCapacities() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngCapacities2();
}
function triggerCngCapacities2() {
	$(".mainPanel").append(
		'<div class="subtitle"Capacities></div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Grain</div>' +
				'<div class="fourColsLabel">Bale</div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="cngCapacitiesGrain"></div>' +
				'<div id="cngCapacitiesBale"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerCngSpecialist() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngSpecialist2();
}
function triggerCngSpecialist2() {
	$(".mainPanel").append(
		'<div class="subtitle">Specialist</div>' +
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
function triggerCngCargoGear() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngCargoGear2();
}
function triggerCngCargoGear2() {
	$(".mainPanel").append(
		'<div class="subtitle">Cargo Gear</div>' +
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
function triggerCngRoro() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngRoro2();
}
function triggerCngRoro2() {
	$(".mainPanel").append(
		'<div class="subtitle">Ro-ro (Lanes,Ramps, and Doors)</div>' +
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
function triggerCngTowage() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngTowage2();
}
function triggerCngTowage2() {
	$(".mainPanel").append(
		'<div class="subtitle">Towage</div>' +
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
function triggerCngMiscellaneous() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngMiscellaneous2();
}
function triggerCngMiscellaneous2() {
	$(".mainPanel").append(
		'<div class="subtitle">Miscellaneous</div>' +
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
function triggerCngViewAll() {
	if(checkImo()){
		return;
	};
	
	createCargoAndGearTitle();
	triggerCngOverview2();
	triggerCngCompartments2();
	triggerCngTanks2();
	triggerCngHatches2();
	triggerCngCapacities2();
	triggerCngSpecialist2();
	triggerCngCargoGear2();
	triggerCngRoro2();
	triggerCngTowage2();
	triggerCngMiscellaneous2();
}
	
// Get information from database and show Machinery info in main panel	
function createMachineryTitle() {
	$(".mainPanel").html(
		'<div class="title">Machinery</div>'	
	);
}
function triggerMacOverview() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacOverview2();
}
function triggerMacOverview2() {
	$(".mainPanel").append(
		'<div class="subtitle">Overview</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel">Speed</div>' +
				'<div class="fourColsLabel"></div>' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerMacPrimeMover() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacPrimeMover2();
}
function triggerMacPrimeMover2() {
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
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="macEngineBuilder"></div>' +
				'<div id="macEngineDetails"></div>' +
				'<div id="macEngineMake"></div>' +
				'<div id="macEngineModel"></div>' +
				'<div id="macEngineType"></div>' +
				'<div id="macEngineLayout"></div>' +
			'</div>' +
			'<div class="fourColsInner">' +
				'<div class="fourColsLabel">Number of Engines</div>' +
				'<div class="fourColsLabel">RPM</div>' +
				'<div class="fourColsLabel">Speed</div>' +
				'<div class="fourColsLabel">Stroke</div>' +
				'<div class="fourColsLabel">Total HP</div>' +
				'<div class="fourColsLabel">Total KW</div>' +	
				
			'</div>' +
			'<div class="fourColsOuter">' +
				'<div id="macEngineNumber"></div>' +
				'<div id="macEngineRPM"></div>' +
				'<div id="macEngineSpeed"></div>' +
				'<div id="macEngineStroke"></div>' +
				'<div id="macEngineHP"></div>' +
				'<div id="macEngineKW"></div>' +
			'</div>' +
		'</div>'
	);
	
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
			// format data; remove NULL strings
			if(!response.vesseldata[0].macEngineBuilder){
				response.vesseldata[0].macEngineBuilder ="N/A";
			}
			if(!response.vesseldata[0].macEngineDetails){
				response.vesseldata[0].macEngineDetails ="N/A";
			}
			if(!response.vesseldata[0].macEngineLayout){
				response.vesseldata[0].macEngineLayout ="N/A";
			}
			if(!response.vesseldata[0].macEngineMake){
				response.vesseldata[0].macEngineMake ="N/A";
			}
			if(!response.vesseldata[0].macEngineModel){
				response.vesseldata[0].macEngineModel ="N/A";
			}
			if(!response.vesseldata[0].macEngineNumber){
				response.vesseldata[0].macEngineNumber ="N/A";
			}
			if(!response.vesseldata[0].macEngineRPM){
				response.vesseldata[0].macEngineRPM ="N/A";
			}
			if(!response.vesseldata[0].macEngineSpeed){
				response.vesseldata[0].macEngineSpeed ="N/A";
			}
			if(!response.vesseldata[0].macEngineStroke){
				response.vesseldata[0].macEngineStroke ="N/A";
			}
			if(!response.vesseldata[0].macEngineHP){
				response.vesseldata[0].macEngineHP ="N/A";
			}
			if(!response.vesseldata[0].macEngineKW){
				response.vesseldata[0].macEngineKW ="N/A";
			}
			if(!response.vesseldata[0].macEngineType){
				response.vesseldata[0].macEngineType ="N/A";
			}
			
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
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerMacAuxEngines() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacAuxEngines2();
}
function triggerMacAuxEngines2() {
	$(".mainPanel").append(
		'<div class="subtitle">Auxiliary Engines</div>' +
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
function triggerMacBoilers() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacBoilers2();
}
function triggerMacBoilers2() {
	$(".mainPanel").append(
		'<div class="subtitle">Boilers</div>' +
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
function triggerMacAuxGenerators() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacAuxGenerators2();
}
function triggerMacAuxGenerators2() {
	$(".mainPanel").append(
		'<div class="subtitle">Auxiliary Generators</div>' +
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
function triggerMacBunkers() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacBunkers2();
}
function triggerMacBunkers2() {
	$(".mainPanel").append(
		'<div class="subtitle">Bunkers</div>' +
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
function triggerMacThrusters() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacThrusters2();
}
function triggerMacThrusters2() {
	$(".mainPanel").append(
		'<div class="subtitle">Thrusters</div>' +
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
function triggerMacViewAll() {
	if(checkImo()){
		return;
	};
	
	createMachineryTitle();
	triggerMacOverview2();
	triggerMacPrimeMover2();
	triggerMacAuxEngines2();
	triggerMacBoilers2();
	triggerMacAuxGenerators2();
	triggerMacBunkers2();
	triggerMacThrusters2();
}
	
// Get information from database and show Classified info in main panel	
function createClassifiedTitle() {
	$(".mainPanel").html(
		'<div class="title">Classified</div>'	
	);
}
function triggerClaOverview() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaOverview2();
}
function triggerClaOverview2() {
	$(".mainPanel").append(
		'<div class="subtitle">Overview</div>' +
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
function triggerClaInspections() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaInspections2();
}
function triggerClaInspections2() {
	var phpWithArg = "query_vessel_details.php?source=claInspections&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	$(".mainPanel").append('<div class="subtitle">Inspections</div>');
		
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
							'<div class="fourColsLabel">Defects</div>' +
							'<div class="fourColsLabel">Release Date</div>' +
							'<div class="fourColsLabel">Authorization</div>' +
							'<div class="fourColsLabel">Manager</div>' +
							'<div class="fourColsLabel">Owner</div>' +
						'</div>' +
						'<div class="fourColsOuter">' +
							'<div id="claInspDetained' + i + '"></div>' +
							'<div id="claInspDaysDetained' + i + '"></div>' +
							'<div id="claInspDefects' + i + '"></div>' +
							'<div id="claInspReleaseDate' + i + '"></div>' +
							'<div id="claInspAuthorisation' + i + '"></div>' +
							'<div id="claInspManager' + i + '"></div>' +
							'<div id="claInspOwner' + i + '"></div>' +
						'</div>' +
					'</div><div><hr></div>'
				);
							
				// format data; remove NULL strings
				if(!response.vesseldata[i].claInspId) {
					response.vesseldata[i].claInspId = "N/A";
				}
				if(!response.vesseldata[i].claInspDate) {
					response.vesseldata[i].claInspDate = "N/A";
				}
				if(!response.vesseldata[i].claInspSource) {
					response.vesseldata[i].claInspSource = "N/A";
				}
				if(!response.vesseldata[i].claInspPort) {
					response.vesseldata[i].claInspPort = "N/A";
				}
				if(!response.vesseldata[i].claInspCountry) {
					response.vesseldata[i].claInspCountry = "N/A";
				}
				if(!response.vesseldata[i].claInspType) {
					response.vesseldata[i].claInspType = "N/A";
				}
				if(!response.vesseldata[i].claInspDetained) {
					response.vesseldata[i].claInspDetained = "N/A";
				}
				if(!response.vesseldata[i].claInspDaysDetained) {
					response.vesseldata[i].claInspDaysDetained = "N/A";
				}
				if(!response.vesseldata[i].claInspDefects) {
					response.vesseldata[i].claInspDefects = "N/A";
				}
				if(!response.vesseldata[i].claInspReleaseDate) {
					response.vesseldata[i].claInspReleaseDate = "N/A";
				}
				if(!response.vesseldata[i].claInspAuthorisation) {
					response.vesseldata[i].claInspAuthorisation = "N/A";
				}
				if(!response.vesseldata[i].claInspManager) {
					response.vesseldata[i].claInspManager = "N/A";
				}
				if(!response.vesseldata[i].claInspOwner) {
					response.vesseldata[i].claInspOwner = "N/A";
				}
				
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
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaCertificates() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaCertificates2();
}
function triggerClaCertificates2() {
	$(".mainPanel").append(
		'<div class="subtitle">Certificates</div>' +
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
function triggerClaSafety() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaSafety2();
}
function triggerClaSafety2() {
	$(".mainPanel").append(
		'<div class="subtitle">Safety Management</div>' +
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
function triggerClaCasualties() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaCasualties2();
}
function triggerClaCasualties2() {
	$(".mainPanel").append(
		'<div class="subtitle">Casualties</div>' +
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
function triggerClaCrew() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaCrew2();
}
function triggerClaCrew2() {
	var phpWithArg = "query_vessel_details.php?source=claCrew&imo="+ imo;
	console.log('phpWithArg: ' + phpWithArg);
	
	$(".mainPanel").append('<div class="subtitle">Crew List</div>');
		
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
				
				// format data; remove NULL strings
				if(!response.vesseldata[i].claCrewId){
					response.vesseldata[i].claCrewId = "N/A";
				}
				if(!response.vesseldata[i].claCrewDate){
					response.vesseldata[i].claCrewDate = "N/A";
				}
				if(!response.vesseldata[i].claCrewNationality){
					response.vesseldata[i].claCrewNationality = "N/A";
				}
				if(!response.vesseldata[i].calCrewTotal){
					response.vesseldata[i].calCrewTotal = "N/A";
				}
				if(!response.vesseldata[i].claCrewOfficers){
					response.vesseldata[i].claCrewOfficers = "N/A";
				}
				if(!response.vesseldata[i].claCrewRatings){
					response.vesseldata[i].claCrewRatings = "N/A";
				}
				
				// display data
				$("#claCrewId"+i).html(response.vesseldata[i].claCrewId);
				$("#claCrewDate"+i).html(response.vesseldata[i].claCrewDate);
				$("#claCrewNationality"+i).html(response.vesseldata[i].claCrewNationality);
				$("#calCrewTotal"+i).html(response.vesseldata[i].calCrewTotal);
				$("#claCrewOfficers"+i).html(response.vesseldata[i].claCrewOfficers);
				$("#claCrewRatings"+i).html(response.vesseldata[i].claCrewRatings);	
			}		
		}		
	}).fail(function() {
		console.log('Vessels Detail: No response from database; error in php?');
		return;
	});
}
function triggerClaViewAll() {
	if(checkImo()){
		return;
	};
	
	createClassifiedTitle();
	triggerClaOverview2();
	triggerClaInspections2();
	triggerClaCertificates2();
	triggerClaSafety2();
	triggerClaCasualties2();
	triggerClaCrew2();
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
