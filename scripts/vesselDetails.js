// call php and get results from database
	var phpWithArg = ""; //php query string
	$.getJSON(
        phpWithArg, // The server URL 
        { }
    ) //end .getJSON()
    .done(function (response) {
		
	}) //end .done()
	.fail(function() { 
         console.log('getPortCalls(): ' +  'No response; error in php?'); 
         return; 
      }); //end .fail()
	  

// Show search results
function searchResults() {
	$(".mainPanel").html(
		'<div class="title">Search Results</div>' +
		'<div>Returned the following search results...</div>'
	);
}

// Show registration info in main panel
function triggerRegistration() {
	$(".mainPanel").html(
		'<div class="title">Registration</div>' +
		'<div class="subtitle">Registration, P&I, and Communications</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Port of Registry</div>' +
				'<div class="fourColsLabel">Official Number</div>' +
				'<div class="fourColsLabel">Sat Com Ans Back</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="portOfRegistry"></div>' +
				'<div id="officialNumber"></div>' +
				'<div id="satComAnsBack"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Flag</div>' +
				'<div class="fourColsLabel">Sat Com ID</div>' +
				'<div class="fourColsLabel">Fishing Number</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="regFlag"></div>' +
				'<div id="satComId"></div>' +
				'<div id="fishingNumber"></div>' +
				'</div>' +
			'</div>' +
		'</div> ' +
		
		'<div>&nbsp;</div>' +
		
		'<div class="subtitle">P&I Club History</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Date</div>' +
				'<div class="fourColsLabel">P&I Club</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="regPniClubDate"></div>' +
				'<div id="regPniClub"></div>' +
			'</div>' +
		'</div>'
	);
	
	init();
}

function triggerOwnership() {
	$(".mainPanel").html(
		'<div class="title">Ownership</div>' +
		'<div class="subtitle">Ownership</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Group Owner</div>' +
				'<div class="fourColsLabel">Ship Manager</div>' +
				'<div class="fourColsLabel">Operator</div>' +
				'<div class="fourColsLabel">DOC Company</div>' +
				'<div class="fourColsLabel">Registered Owner</div>' +
				'<div class="fourColsLabel">Technical Manager</div>' +
				'<div class="fourColsLabel">Bareboat Owner</div>' +
				'<div class="fourColsLabel">IMO Company No (DOC)</div>' +
				'<div class="fourColsLabel">IMO Registered Owner No</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="ownershipGroupOwner"></div>' +
				'<div id="ownershipShipManager"></div>' +
				'<div id="ownershipOperator"></div>' +
				'<div id="ownershipDocCompany"></div>' +
				'<div id="ownershipRegisteredOwner"></div>' +
				'<div id="ownershipTechnicalManager"></div>' +
				'<div id="ownershipBareboatOwner"></div>' +
				'<div id="imoCompanyNo"></div>' +
				'<div id="imoRegisteredOwnerNo"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
				'<div class="fourColsLabel">Location</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="location1"></div>' +
				'<div id="location2"></div>' +
				'<div id="location3"></div>' +
				'<div id="location4"></div>' +
				'<div id="location5"></div>' +
				'<div id="location6"></div>' +
				'<div id="location7"></div>' +
			'</div>' +
		'</div>'
	);
	
	init();
}

function triggerCommercialHistory() {
	$(".mainPanel").html(
		'<div class="title">Commercial History</div>' +
		'<div class="subtitle">Commercial History</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
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
			'<div class="fourCols">' +
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

	init();	
}

function triggerClass() {
	$(".mainPanel").html(
		'<div class="title">Class</div>' +
		'<div class="subtitle">Class</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Class</div>' +
				'<div class="fourColsLabel">Class ID</div>' +
				'<div class="fourColsLabel">NK</div>' +
				'<div class="fourColsLabel">Survey Date</div>' +
				'<div class="fourColsLabel">Class Notation</div>' +
			'</div>' +
			'<div class="fourCols">' +
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
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Date</div>' +
				'<div class="fourColsLabel">Class</div>' +
				'<div class="fourColsLabel">Status</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="clasDate"></div>' +
				'<div id="clas2"></div>' +
				'<div id="clasStatus"></div>' +
			'</div>' +
		'</div>'
	);

	init();	
}

function triggerSurveys() {
	$(".mainPanel").html(
		'<div class="title">Surveys</div>' +
		'<div class="subtitle">Surveys</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourCols">' +
			'</div>' + 
		'</div>' +
		
		'<div>&nbsp;</div>' +
		
		'<div class="subtitle">Surveys</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Date</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="clasDate"></div>' +
			'</div>' +
		'</div>'
	);

	init();	
}

function createConstructionTitle(){
	$(".mainPanel").html(
		'<div class="title">Construction</div>'		
	);
}
function triggerConOverview() {
	createConstructionTitle();
	triggerConOverview2();
	init();
}
function triggerConOverview2() {
	$(".mainPanel").append(
		'<div class="subtitle">Overview</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Shipt Type</div>' +
				'<div class="fourColsLabel">Built</div>' +
				'<div class="fourColsLabel">GT</div>' +
				'<div class="fourColsLabel">Deadweight</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="conShipType"></div>' +
				'<div id="conBuilt"></div>' +
				'<div id="conGt"></div>' +
				'<div id="conDeadweight"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConShipbuilderStatus() {
	createConstructionTitle();
	triggerConShipbuilderStatus2();
	init();
}
function triggerConShipbuilderStatus2() {
	$(".mainPanel").append(
		'<div class="subtitle">Shipbuilder Status</div>' +
		'<div class="fourColsContainer">' +
			'<div id="conShipBuilder"></div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Date</div>' +
				'<div id="conDate1"></div>' +
				'<div id="conDate2"></div>' +
				'<div id="conDate3"></div>' +
				'<div id="conDate4"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Status</div>' +
				'<div id="conStatus2"></div>' +
				'<div id="conStatus3"></div>' +
				'<div id="conStatus4"></div>' +
				'<div id="conStatus4"></div>' +
			'</div>' +
		'</div>'
	);	
}	
function triggerConConstructionDetail() {
	createConstructionTitle();
	triggerConConstructionDetail2();
	init();
}
function triggerConConstructionDetail2() {
	$(".mainPanel").append(
		'<div class="subtitle">Construction Detail</div>' +
		'<div class="fourColsContainer">' +
			'<div id="conConstructionDetail"></div>' +
		'</div>'
	);
}	
function triggerConServiceConstraints() {
	createConstructionTitle();
	triggerConServiceConstraints2();
	init();
}
function triggerConServiceConstraints2() {
	$(".mainPanel").append(
		'<div class="subtitle">Service Constraints</div>' +
		'<div class="fourColsContainer">' +
			'<div id="conServiceConstraints"></div>' +
		'</div>'
	);
}	
function triggerConAlterations() {
	createConstructionTitle();
	triggerConAlterations2();
	init();
}
function triggerConAlterations2() {
	$(".mainPanel").append(
		'<div class="subtitle">Alterations</div>' +
		'<div class="fourColsContainer">' +
			'<div id="conAlterations"></div>' +
		'</div>'
	);
}	
function triggerConDimensions() {
	createConstructionTitle();
	triggerConDimensions2();
	init();	
}	
function triggerConDimensions2() {
	$(".mainPanel").append(
		'<div class="subtitle">Dimensions</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Length Overall</div>' +
				'<div class="fourColsLabel">Length (Reg)</div>' +
				'<div class="fourColsLabel">Breadth Extreme</div>' +
				'<div class="fourColsLabel">Draught</div>' +
				'<div class="fourColsLabel">Height</div>' +
				'<div class="fourColsLabel">Displacement</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="conLengthOverall"></div>' +
				'<div id="conLengthReg"></div>' +
				'<div id="conBreadthExtreme"></div>' +
				'<div id="conDraught"></div>' +
				'<div id="conHeight"></div>' +
				'<div id="conDisplacement"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Length (BP)</div>' +
				'<div class="fourColsLabel">Bulbous Bow</div>' +
				'<div class="fourColsLabel">Breadth Moulded</div>' +
				'<div class="fourColsLabel">Depth</div>' +
				'<div class="fourColsLabel">&nbsp;</div>' +
				'<div class="fourColsLabel">T/CM</div>' +
			'</div>' +
			'<div class="fourCols">' +
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
	createConstructionTitle();
	triggerConTonnages2();
	init();	
}	
function triggerConTonnages2() {
	$(".mainPanel").append(
		'<div class="subtitle">Tonnages</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Tonnage Type</div>' +
				'<div class="fourColsLabel">Effective Date</div>' +
				'<div class="fourColsLabel">Gross Tonnage (GT)</div>' +
				'<div class="fourColsLabel">Deadweight (DWT)</div>' +
				'<div class="fourColsLabel">Formula Deadweight</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="conTonnageType"></div>' +
				'<div id="conEffectiveDate"></div>' +
				'<div id="conGrossTonnage"></div>' +
				'<div id=conDeadweight""></div>' +
				'<div id="conFormulaDeadweight"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Tonnage System</div>' +
				'<div class="fourColsLabel">Net Tonnage (NT)</div>' +
				'<div class="fourColsLabel">Compensated Gross Tonnage (CGT)</div>' +
				'<div class="fourColsLabel">Light Displacement Tonnage (LDT)</div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id="conTonnageSystem"></div>' +
				'<div id="conNetTonnage"></div>' +
				'<div id="conCompensatedGrossTonnage"></div>' +
				'<div id="conLightDisplacementTonnage"></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConArrangement() {
	createConstructionTitle();
	triggerConArrangement2();
	init();	
}	
function triggerConArrangement2() {
	$(".mainPanel").append(
		'<div class="subtitle">Arrangement</div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Structure</div>' +
				'<div id="conStructure1"></div>' +
				'<div id="conStructure2"></div>' +
				'<div id="conStructure3"></div>' +
				'<div id="conStructure4"></div>' +
				'<div id="conStructure5"></div>' +
				'<div id="conStructure6"></div>' +
				'<div id="conStructure7"></div>' +
				'<div id="conStructure8"></div>' +
				'<div id="conStructure9"></div>' +
				'<div id="conStructure10"></div>' +
				'<div id="conStructure11"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Sequence (Bow to Stern)</div>' +
				'<div id="conSequence1"></div>' +
				'<div id="conSequence2"></div>' +
				'<div id="conSequence3"></div>' +
				'<div id="conSequence4"></div>' +
				'<div id="conSequence5"></div>' +
				'<div id="conSequence6"></div>' +
				'<div id="conSequence7"></div>' +
				'<div id="conSequence8"></div>' +
				'<div id="conSequence9"></div>' +
				'<div id="conSequence10"></div>' +
				'<div id="conSequence11"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Position</div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Type</div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Material</div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Length</div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel">Breadth</div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);
}
function triggerConSisterShips() {
	createConstructionTitle();
	triggerConSisterShips2();
	init();
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
	createConstructionTitle();
	triggerConSupplementaryFeatures2();
	init();	
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
	createConstructionTitle();
	triggerConOverview2();
	triggerConShipbuilderStatus2;
	triggerConConstructionDetail2();
	triggerConServiceConstraints2();
	triggerConAlterations2();
	triggerConDimensions2();
	triggerConTonnages2();
	triggerConArrangement2();
	triggerConSisterShips2();
	triggerConSupplementaryFeatures2();
	init();	
}	



	
function functionName() {
	$(".mainPanel").html(
		'<div class="title"></div>' +
		'<div class="fourColsContainer">' +
			'<div class="fourCols">' +
				'<div class="fourColsLabel"></div>' +
			'</div>' +
			'<div class="fourCols">' +
				'<div id=""></div>' +
			'</div>' +
		'</div>'
	);

	init();	
}	
