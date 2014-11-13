/**
 * @name risk.js
 * @author Julie Luu
 * @fileoverview
 * Script to allow users to specify RISK score configuration 
 */

 /* -------------------------------------------------------------------------------- */
/**
 *  Global Variables
 */
 
// saved RISK configuration entries
var riskName = new Array();
var riskSec  = new Array();
var riskSaf = new Array();
var riskMou = new Array();
var riskNat1 = new Array();
var riskNat2 = new Array();
var riskSize = 0;

/*
// security definitions
var secTerm = new Array(
	"ISPS 1 and 2 Boundary",
	"ISPS 2 and 3 Boundary",
	"Company Security",
	"Black Flag Security",
	"Gray Flag Security",
	"No ISPS Inspection",
	"ISPS Detention",
	"ISPS Minor Control",
	"ISPS Inspection History",
	"Insecure Port",
	"Allow ISPS Downgrade",
	"Port Not ISPS",
	"No Port History",
	"Nationalities Risk",
	"No Crew Data"
);
var secDef = new Array(
	"Threshold for security risk score that recommends vessel be inspected before arrival in port.",
	"Threshold for security risk score that recommends vessel be inspected after arrival in port.",
	"Points assessed if the owner/operator/manager appears on the targeted company (black) list.",
	"Points assessed if the vessel's country of registry appears on the flag state black list.",
	"Points assessed if the vessel's country of registry appears on the flag state gray list.",
	"Points assessed if there is no record of an ISPS inspection within the previous year.",
	"Points assessed for an ISPS detention within the previous year.",
	"Points assessed if the vessel has been subject to a minor ISPS control action (not an inspection or detention).",
	"Points assessed if there have been 5 or fewer ISPS inspections within the past 3 years.",
	"Points assessed if the vessel visits a port deemed insecure by the International Port Security Program within the last 5 ports visited.",
	"Indication to allow points assessed for visiting an insecure port.",
	"Points assessed per visit to a port deemed not to be ISPS compliant (within the previous 5 ports of call).",
	"Points assessed if there is no port call data for this vessel (occurs when we don't have  a MMSI for the vessel).",
	"Points assessed when members of the crew are from countries the user defines as posing a threat to security.",
	"Points assessed if there is no information about the crew available for this vessel."
);
var secLength = secTerm.length;

// safety definitions
var safTerm = new Array(
	"PSC 1 and 2 Boundary",
	"PSC 2 and 3 Boundary",
	"Company Safety",
	"Black Flag Safety",
	"Gray Flag Safety",
	"High Class",
	"Medium Class",
	"Low Class",
	"No PSC Inspection",
	"PSC Detention",
	"Other Control",
	"Casualty/Pollution",
	"Marine Violation",
	"Tanker/Passenger",
	"Age Less Than 10",
	"Age 10 to 20",
	"Age Greater Than 20",
	"Multiple Admin Changes"
);
var safDef = new Array(
	"Threshold for safety risk score that recommends vessel be inspected before arrival in port.",
	"Threshold for safety risk score that recommends that the vessel be inspected while in port.",
	"Points assessed if the owner/operator/manager of a vessel is on the targeted (black) list for safety.",
	"Points assessed if the vessel's country of registry appears on the targeted (black) flag state list for safety.",
	"Points assessed if the vessel's country of registry appears on the targeted (gray) flag state list for safety.",
	"Points assessed if the vessel's classification society appears in the targeted (high) list for safety.",
	"Points assessed if the vessel's classification society appears in the targeted (medium) list for safety.",
	"Points assessed if the vessel's classification society appears in the targeted (low) list for safety.",
	"Points assessed if the vessel has not undergone a port state control inspection within the previous year.",
	"Points assessed for each time the vessel has been detained for port state control violations within the previous year.",
	"Points assessed for each incident where the vessel has been the subject of operational control actions (other than detention) within the previous year.",
	"Points assessed for each casualty or pollution event within the previous year.",
	"Points assessed for each marine violation (except pollution) within the previous year.",
	"Points assessed if the vessel is a tanker or passenger vessel.",
	"Points assessed if the vessel is a cargo vessel less than 10 years old.",
	"Points assessed if the vessel is a cargo vessel between 10 and 20 years old.",
	"Points assessed if the vessel is a cargo vessel greater than 20 years old. This penalty is assessed if the age of the vessel is unknown.",
	"Points assessed if the vessel's owner/operator/manager/flag has changed multiple times within the previous year. Multiple changes occurring on a single day are considered a single change."
);
var safLength = safTerm.length;
*/
// initialize input settings on page load 
function initialize() {
	$(function() {
	// SECURITY
		$("#secSCompany").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secACompany').val(ui.value);
			}
		});
		$("#secSBlackFlag").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secABlackFlag').val(ui.value);
			}
		});
		$("#secSGrayFlag").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secAGrayFlag').val(ui.value);
			}
		});
		$("#secSNoInsp").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secANoInsp').val(ui.value);
			}
		});
		$("#secSInspHist").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secAInspHist').val(ui.value);
			}
		});
		$("#secSDetention").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secADetention').val(ui.value);
			}
		});
		$("#secSMinorControl").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secAMinorControl').val(ui.value);
			}
		});
		$("#secSNationality").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secANationality').val(ui.value);
			}
		});
		$("#secSInsPort").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secAInsPort').val(ui.value);
			}
		});
		$("#secSPortNotISPS").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secAPortNotISPS').val(ui.value);
			}
		});
		$("#secSNoPortHist").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secANoPortHist').val(ui.value);
			}
		});		
		$("#secSCrewData").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#secACrewData').val(ui.value);
			}
		});
		$("#secACompany").val($("#secSCompany").slider("value"));
		$("#secABlackFlag").val($("#secSBlackFlag").slider("value"));
		$("#secAGrayFlag").val($("#secSGrayFlag").slider("value"));
		$("#secANoInsp").val($("#secSNoInsp").slider("value"));
		$("#secAInspHist").val($("#secSInspHist").slider("value"));
		$("#secADetention").val($("#secSDetention").slider("value"));
		$("#secAMinorControl").val($("#secSMinorControl").slider("value"));
		$("#secANationality").val($("#secSNationality").slider("value"));
		$("#secAInsPort").val($("#secSInsPort").slider("value"));
		$("#secAPortNotISPS").val($("#secSPortNotISPS").slider("value"));
		$("#secANoPortHist").val($("#secSNoPortHist").slider("value"));	
		$("#secACrewData").val($("#secSCrewData").slider("value"));
		
	// SAFETY
		$("#safSCompany").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safACompany').val(ui.value);
			}
		});
		$("#safSBlackFlag").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safABlackFlag').val(ui.value);
			}
		});
		$("#safSGrayFlag").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAGrayFlag').val(ui.value);
			}
		});
		$("#safSHighClass").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAHighClass').val(ui.value);
			}
		});
		$("#safSMedClass").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAMedClass').val(ui.value);
			}
		});
		$("#safSLowClass").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safALowClass').val(ui.value);
			}
		});
		$("#safSNoInsp").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safANoInsp').val(ui.value);
			}
		});
		$("#safSDetention").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safADetention').val(ui.value);
			}
		});
		$("#safSControl").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAControl').val(ui.value);
			}
		});
		$("#safSCasualty").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safACasualty').val(ui.value);
			}
		});
		$("#safSViolation").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAViolation').val(ui.value);
			}
		});	
		$("#safSTankerPass").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safATankerPass').val(ui.value);
			}
		});
		$("#safSLt10").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safALt10').val(ui.value);
			}
		});
		$("#safS10to20").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safA10to20').val(ui.value);
			}
		});
		$("#safSGt20").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAGt20').val(ui.value);
			}
		});
		$("#safSMultiAdmin").slider({
			value: 1,
			min: -2,
			max: 7,
			step: 1,
			slide: function(event,ui) {
				$('#safAMultiAdmin').val(ui.value);
			}
		});
		$("#safACompany").val($("#safSCompany").slider("value"));
		$("#safABlackFlag").val($("#safSBlackFlag").slider("value"));
		$("#safAGrayFlag").val($("#safSGrayFlag").slider("value"));
		$("#safAHighClass").val($("#safSHighClass").slider("value"));
		$("#safAMedClass").val($("#safSMedClass").slider("value"));
		$("#safALowClass").val($("#safSLowClass").slider("value"));
		$("#safANoInsp").val($("#safSNoInsp").slider("value"));
		$("#safADetention").val($("#safSDetention").slider("value"));
		$("#safAControl").val($("#safSControl").slider("value"));
		$("#safACasualty").val($("#safSCasualty").slider("value"));
		$("#safAViolation").val($("#safSViolation").slider("value"));
		$("#safATankerPass").val($("#safSTankerPass").slider("value"));
		$("#safALt10").val($("#safSLt10").slider("value"));
		$("#safA10to20").val($("#safS10to20").slider("value"));
		$("#safAGt20").val($("#safSGt20").slider("value"));
		$("#safAMultiAdmin").val($("#safSMultiAdmin").slider("value"));
	});
	
	//setDefaultSecurity();
	//setDefaultSafety();
	
	
		// start sliders on page load
/*	var secS = new Array('#secSCompany','#secSBlackFlag','#secSNoInsp','#secSInspHist','#secSDetention','#secSNationality');
	var secA = new Array('#secACompany','#secABlackFlag','#secANoInsp','#secAInspHist','#secADetention','#secANationality');
	var safS = new Array('safSCompany','safSGrayFlag','safSCasualty','safSPollution','safSViolation');
	var safA = new Array('safACompany','safAGrayFlag','safACasualty','safAPollution','safAViolation');
	var secSize = secS.length;
	var safSize = safS.length;
		
	$(function() {
		for(var i=0;i<secSize;i++) {
			$(secS[i]).slider({
				value: 1,
				min: 0,
				max: 17,
				step: 1,
				slide: function(event,ui) {
					$(secA[i]).val(ui.value);
				}
			});
			
		}
		for(var i=0;i<secSize;i++) {
			$(secA[i]).val($(secS[i]).slider("value"));
		}
		
		for(var i=0;i<safSize;i++){
			$('#'+safS[i]).slider({
				value: 1,
				min: 0,
				max: 17,
				step: 1,
				slide: function(event,ui) {
					$('#'+safA[i]).val(ui.value);
				}
			});
			$('#'+safA[i]).val($('#'+safS[i]).slider("value"));
		}
	});
*/
}
 /*
// show definitions section
function showDefs() {
	$('#definitions').html(
		'<div class="blueTitle">Definitions</div>' +
		'<div>Below is a list of definitions for fields in the various tabs.<br /></div>' +
		'<div>&nbsp;</div>' +
		'<div class="subtitle">ISPS Compliance</div>'
	);
	for (var i=0;i<secLength;i++) {
		$('#definitions').append(
			'<div class="defClear">' +
			'<div class="defLeft">' + secTerm[i] + '</div>' +
			'<div class="defRight">' + secDef[i] + '</div>' +
			'</div>'
		);
	}
	$('#definitions').append(
		'<div>&nbsp;</div>' +
		'<div class="subtitle">PSC Safety & Environmental Compliance</div>'
	);
	for (var i=0;i<safLength;i++) {
		$('#definitions').append(
			'<div class="defClear">' +
			'<div class="defLeft">' + safTerm[i] + '</div>' +
			'<div class="defRight">' + safDef[i] + '</div>' +
			'</div>'
		);
	}
}
 */
// functions to get value from user settings
function getSec()  {
	var secArr = new Array();
	
	secArr[0] = $("#secBound1").val();
	secArr[1] = $("#secBound2").val();
	secArr[2] = $("#secSCompany").slider("value");
	secArr[3] = $("#secSBlackFlag").slider("value");
	secArr[4] = $("#secSGrayFlag").slider("value");
	secArr[5] = $("#secSNoInsp").slider("value");
	secArr[6] = $("#secSInspHist").slider("value");
	secArr[7] = $("#secSDetention").slider("value");
	secArr[8] = $("#secSMinorControl").slider("value");
	secArr[9] = $("#secSNationality").slider("value");
	secArr[10] = $("#secSInsPort").slider("value");
	secArr[11] = $("#secSPortNotISPS").slider("value");
	secArr[12] = $("#secSNoPortHist").slider("value");
	secArr[13] = $("#secSCrewData").slider("value");
	secArr[14] = $("#secDowngrade option:selected").text();
	secArr[15] = $("#secSliderMax").val();
	
	return secArr;
}
function getSaf() {
	var safArr = new Array();
	
	safArr[0] = $("#safBound1").val();
	safArr[1] = $("#safBound2").val();
	safArr[2] = $("#safSCompany").slider("value");
	safArr[3] = $("#safSBlackFlag").slider("value");
	safArr[4] = $("#safSGrayFlag").slider("value");
	safArr[5] = $("#safSHighClass").slider("value");
	safArr[6] = $("#safSMedClass").slider("value");
	safArr[7] = $("#safSLowClass").slider("value");
	safArr[8] = $("#safSNoInsp").slider("value");
	safArr[9] = $("#safSDetention").slider("value");
	safArr[10] = $("#safSControl").slider("value");
	safArr[11] = $("#safSCasualty").slider("value");
	safArr[12] = $("#safSViolation").slider("value");
	safArr[13] = $("#safSTankerPass").slider("value");
	safArr[14] = $("#safSLt10").slider("value");
	safArr[15] = $("#safS10to20").slider("value");
	safArr[16] = $("#safSGt20").slider("value");
	safArr[17] = $("#safSMultiAdmin").slider("value");
	safArr[18] = $("#safSliderMax").val();
	
	return safArr;
}
function getMou() {
	return $('#moulist option:selected').text();
}
function getNatList1() {
	var natList = [];
	$("#sortable1 li").each(function() {
		natList.push($(this).text());
	});
	
	return natList;
}
function getNatList2() {
	var natList = [];
	$("#sortable2 li").each(function() {
		natList.push($(this).text());
	});
	
	return natList;
}

// functions to set value for user settings
function setDefaultSecurity() {
	// set default value for security sliders
	$('#secSliderMax').val('7');
	setSecSliderMax();
	
	var secArr = new Array(5,7,2,2,2,5,4,1,0,7,7,7,0);
	setSecurity(secArr);
	
	$('#secSliderMax').val('7');
	setSecSliderMax();
	$("#secBound1").val('14');
	$("#secBound2").val('21');
}
function setDefaultSafety() {
	// set default settings for safety sliders
	$('#safSliderMax').val('7');
	setSafSliderMax();
	
	var safArr = new Array(5,7,2,1,2,3,7,7,7,7,7,7,7,7,7,7);
	setSafety(safArr);
	
	$('#safSliderMax').val('7');
	setSafSliderMax();
	$("#safBound1").val('14');
	$("#safBound2").val('21');
}
function setSecSliderMax() {
	// set max value for security sliders
	var val = $('#secSliderMax').val();

	// change slider
	$("#secSCompany").slider("option","max",val);
	$("#secSBlackFlag").slider("option","max",val);
	$("#secSGrayFlag").slider("option","max",val);
	$("#secSNoInsp").slider("option","max",val);
	$("#secSInspHist").slider("option","max",val);
	$("#secSDetention").slider("option","max",val);
	$("#secSMinorControl").slider("option","max",val);
	$("#secSNationality").slider("option","max",val);
	$("#secSInsPort").slider("option","max",val);
	$("#secSPortNotISPS").slider("option","max",val);
	$("#secSNoPortHist").slider("option","max",val);
	$("#secSCrewData").slider("option","max",val);
	
	// display change
	$("#secACompany").val($("#secSCompany").slider("value"));
	$("#secABlackFlag").val($("#secSBlackFlag").slider("value"));
	$("#secAGrayFlag").val($("#secSGrayFlag").slider("value"));
	$("#secANoInsp").val($("#secSNoInsp").slider("value"));
	$("#secAInspHist").val($("#secSInspHist").slider("value"));
	$("#secADetention").val($("#secSDetention").slider("value"));
	$("#secAMinorControl").val($("#secSMinorControl").slider("value"));
	$("#secANationality").val($("#secSNationality").slider("value"));
	$("#secAInsPort").val($("#secSInsPort").slider("value"));
	$("#secAPortNotISPS").val($("#secSPortNotISPS").slider("value"));
	$("#secANoPortHist").val($("#secSNoPortHist").slider("value"));	
	$("#secACrewData").val($("#secSCrewData").slider("value"));
}
function setSafSliderMax() {
	// set max value for safety sliders
	var val = $('#safSliderMax').val();
	
	// change slider
	$("#safSCompany").slider("option","max",val);
	$("#safSBlackFlag").slider("option","max",val);
	$("#safSGrayFlag").slider("option","max",val);
	$("#safSHighClass").slider("option","max",val);
	$("#safSMedClass").slider("option","max",val);
	$("#safSLowClass").slider("option","max",val);
	$("#safSNoInsp").slider("option","max",val);
	$("#safSDetention").slider("option","max",val);
	$("#safSControl").slider("option","max",val);
	$("#safSCasualty").slider("option","max",val);
	$("#safSViolation").slider("option","max",val);
	$("#safSTankerPass").slider("option","max",val);
	$("#safSLt10").slider("option","max",val);
	$("#safS10to20").slider("option","max",val);
	$("#safSGt20").slider("option","max",val);
	$("#safSMultiAdmin").slider("option","max",val);
	
	// display change
	$("#safACompany").val($("#safSCompany").slider("value"));
	$("#safABlackFlag").val($("#safSBlackFlag").slider("value"));
	$("#safAGrayFlag").val($("#safSGrayFlag").slider("value"));
	$("#safAHighClass").val($("#safSHighClass").slider("value"));
	$("#safAMedClass").val($("#safSMedClass").slider("value"));
	$("#safALowClass").val($("#safSLowClass").slider("value"));
	$("#safANoInsp").val($("#safSNoInsp").slider("value"));
	$("#safADetention").val($("#safSDetention").slider("value"));
	$("#safAControl").val($("#safSControl").slider("value"));
	$("#safACasualty").val($("#safSCasualty").slider("value"));
	$("#safAViolation").val($("#safSViolation").slider("value"));
	$("#safATankerPass").val($("#safSTankerPass").slider("value"));
	$("#safALt10").val($("#safSLt10").slider("value"));
	$("#safA10to20").val($("#safS10to20").slider("value"));
	$("#safAGt20").val($("#safSGt20").slider("value"));
	$("#safAMultiAdmin").val($("#safSMultiAdmin").slider("value"));
}
function setSecurity(arr) {
	// set value for security sliders
	$("#secSCompany").slider({
		value: arr[0],
		slide: function(event,ui) {
			$('#secACompany').val(ui.value);
		}
	});
	$("#secSBlackFlag").slider({
		value: arr[1],
		slide: function(event,ui) {
			$('#secABlackFlag').val(ui.value);
		}
	});
	$("#secSGrayFlag").slider({
		value: arr[2],
		slide: function(event,ui) {
			$('#secAGrayFlag').val(ui.value);
		}
	});
	$("#secSNoInsp").slider({
		value: arr[3],
		slide: function(event,ui) {
			$('#secANoInsp').val(ui.value);
		}
	});
	$("#secSInspHist").slider({
		value: arr[4],
		slide: function(event,ui) {
			$('#secAInspHist').val(ui.value);
		}
	});
	$("#secSDetention").slider({
		value: arr[5],
		slide: function(event,ui) {
			$('#secADetention').val(ui.value);
		}
	});
	$("#secSMinorControl").slider({
		value: arr[6],
		slide: function(event,ui) {
			$('#secAMinorControl').val(ui.value);
		}
	});
	$("#secSNationality").slider({
		value: arr[7],
		slide: function(event,ui) {
			$('#secANationality').val(ui.value);
		}
	});
	$("#secSInsPort").slider({
		value: arr[8],
		slide: function(event,ui) {
			$('#secAInsPort').val(ui.value);
		}
	});
	$("#secSPortNotISPS").slider({
		value: arr[9],
		slide: function(event,ui) {
			$('#secAPortNotISPS').val(ui.value);
		}
	});
	$("#secSNoPortHist").slider({
		value: arr[10],
		slide: function(event,ui) {
			$('#secANoPortHist').val(ui.value);
		}
	});
	$("#secSCrewData").slider({
		value: arr[11],
		slide: function(event,ui) {
			$('#secACrewData').val(ui.value);
		}
	});
	$("#secDowngrade").val(arr[12]);
	$("#secACompany").val($("#secSCompany").slider("value"));
	$("#secABlackFlag").val($("#secSBlackFlag").slider("value"));
	$("#secAGrayFlag").val($("#secSGrayFlag").slider("value"));
	$("#secANoInsp").val($("#secSNoInsp").slider("value"));
	$("#secAInspHist").val($("#secSInspHist").slider("value"));
	$("#secADetention").val($("#secSDetention").slider("value"));
	$("#secAMinorControl").val($("#secSMinorControl").slider("value"));
	$("#secANationality").val($("#secSNationality").slider("value"));
	$("#secAInsPort").val($("#secSInsPort").slider("value"));
	$("#secAPortNotISPS").val($("#secSPortNotISPS").slider("value"));
	$("#secANoPortHist").val($("#secSNoPortHist").slider("value"));
	$("#secACrewData").val($("#secSCrewData").slider("value"));
	
}
function setSafety(arr) {
	// set value for safety sliders
	$("#safSCompany").slider({
		value: arr[0],
		slide: function(event,ui) {
			$('#safACompany').val(ui.value);
		}
	});
	$("#safSBlackFlag").slider({
		value: arr[1],
		slide: function(event,ui) {
			$('#safABlackFlag').val(ui.value);
		}
	});
	$("#safSGrayFlag").slider({
		value: arr[2],
		slide: function(event,ui) {
			$('#safAGrayFlag').val(ui.value);
		}
	});
	$("#safSHighClass").slider({
		value: arr[3],
		slide: function(event,ui) {
			$('#safAHighClass').val(ui.value);
		}
	});
	$("#safSMedClass").slider({
		value: arr[4],
		slide: function(event,ui) {
			$('#safAMedClass').val(ui.value);
		}
	});
	$("#safSLowClass").slider({
		value: arr[5],
		slide: function(event,ui) {
			$('#safALowClass').val(ui.value);
		}
	});
	$("#safSNoInsp").slider({
		value: arr[6],
		slide: function(event,ui) {
			$('#safANoInsp').val(ui.value);
		}
	});
	$("#safSDetention").slider({
		value: arr[7],
		slide: function(event,ui) {
			$('#safADetention').val(ui.value);
		}
	});
	$("#safSControl").slider({
		value: arr[8],
		slide: function(event,ui) {
			$('#safAControl').val(ui.value);
		}
	});
	$("#safSCasualty").slider({
		value: arr[9],
		slide: function(event,ui) {
			$('#safACasualty').val(ui.value);
		}
	});
	$("#safSViolation").slider({
		value: arr[10],
		slide: function(event,ui) {
			$('#safAViolation').val(ui.value);
		}
	});
	$("#safSTankerPass").slider({
		value: arr[11],
		slide: function(event,ui) {
			$('#safATankerPass').val(ui.value);
		}
	});
	$("#safSLt10").slider({
		value: arr[12],
		slide: function(event,ui) {
			$('#safALt10').val(ui.value);
		}
	});
	$("#safS10to20").slider({
		value: arr[13],
		slide: function(event,ui) {
			$('#safA10to20').val(ui.value);
		}
	});
	$("#safSGt20").slider({
		value: arr[14],
		slide: function(event,ui) {
			$('#safAGt20').val(ui.value);
		}
	});
	$("#safSMultiAdmin").slider({
		value: arr[15],
		slide: function(event,ui) {
			$('#safAMultiAdmin').val(ui.value);
		}
	});
	$("#safACompany").val($("#safSCompany").slider("value"));
	$("#safABlackFlag").val($("#safSBlackFlag").slider("value"));
	$("#safAGrayFlag").val($("#safSGrayFlag").slider("value"));
	$("#safAHighClass").val($("#safSHighClass").slider("value"));
	$("#safAMedClass").val($("#safSMedClass").slider("value"));
	$("#safALowClass").val($("#safSLowClass").slider("value"));
	$("#safANoInsp").val($("#safSNoInsp").slider("value"));
	$("#safADetention").val($("#safSDetention").slider("value"));
	$("#safAControl").val($("#safSControl").slider("value"));
	$("#safACasualty").val($("#safSCasualty").slider("value"));
	$("#safAViolation").val($("#safSViolation").slider("value"));
	$("#safATankerPass").val($("#safSTankerPass").slider("value"));
	$("#safALt10").val($("#safSLt10").slider("value"));
	$("#safA10to20").val($("#safS10to20").slider("value"));
	$("#safAGt20").val($("#safSGt20").slider("value"));
	$("#safAMultiAdmin").val($("#safSMultiAdmin").slider("value"));
}
function setMou(str) {
	// set value for MOU List
	$("#moulist").val(str);
}
function setNat1(natArr) {
	// set Nationalities list to choose nationalities from
	$('#sortable1').empty();
	
	for(var i=0; i<natArr.length;i++) {
		if(natArr[i]) {
			var $li = setNat(natArr[i]);
			$("#sortable1").append($li);			
		}
	}
	$("#sortable1").sortable('refresh');	
}
function setNat2(natArr) {
	// set Nationalities list for calculating risk score
	$('#sortable2').empty();
	
	for(var i=0; i<natArr.length;i++) {
		if(natArr[i]) {
			var $li = setNat(natArr[i]);
			$("#sortable2").append($li);			
		}
	}	
	$("#sortable2").sortable('refresh');
}
function setNat(natArrEl) {
	// function: creates list item to add to the Nationalities list
	// parameter: accepts a string
	// return: a list element
	var text = natArrEl;
	var $li = $("<li class='ui-state-default'/>").text(text);
		
	switch (natArrEl) {
		case "Afghan":
			$li.append('<span class="natFlag"><img src="flags/Afghanistan.gif" /></span>');					
			break;
		case "&#197;land Islander":
			$li.append('<span class="natFlag"><img src="flags/AlandIslands.gif" /></span>');
			break;
		case "Åland Islander":
			$li.append('<span class="natFlag"><img src="flags/AlandIslands.gif" /></span>');
			break;
		case "Albanian":
			$li.append('<span class="natFlag"><img src="flags/Albania.gif" /></span>');
			break;
		case "Algerian":
			$li.append('<span class="natFlag"><img src="flags/Algeria.gif" /></span>');
			break;
		case "American":
			$li.append('<span class="natFlag"><img src="flags/UnitedStatesofAmerica.gif" /></span>');
			break;
		case "Andorran":
			$li.append('<span class="natFlag"><img src="flags/Andorra.gif" /></span>');
			break;
		case "Angolan":
			$li.append('<span class="natFlag"><img src="flags/Angola.gif" /></span>');
			break;
		case "Anguillan":
			$li.append('<span class="natFlag"><img src="flags/Anguilla.gif" /></span>');
			break;
		case "Antiguan":
			$li.append('<span class="natFlag"><img src="flags/AntiguaAndBarbuda.gif" /></span>');
			break;
		case "Argentine":
			$li.append('<span class="natFlag"><img src="flags/Argentina.gif" /></span>');
			break;
		case "Armenian":
			$li.append('<span class="natFlag"><img src="flags/Armenia.gif" /></span>');
			break;
		case "Australian":
			$li.append('<span class="natFlag"><img src="flags/Australia.gif" /></span>');
			break;
		case "Austrian":
			$li.append('<span class="natFlag"><img src="flags/Austria.gif" /></span>');
			break;
		case "Azerbaijani":
			$li.append('<span class="natFlag"><img src="flags/Azerbaijan.gif" /></span>');
			break;
		case "Bahamian":
			$li.append('<span class="natFlag"><img src="flags/Bahamas.gif" /></span>');
			break;
		case "Bangladeshi":
			$li.append('<span class="natFlag"><img src="flags/Bangladesh.gif" /></span>');
			break;
		case "Barbadian":
			$li.append('<span class="natFlag"><img src="flags/Barbados.gif" /></span>');
			break;
		case "Belarusian":
			$li.append('<span class="natFlag"><img src="flags/Belarus.gif" /></span>');
			break;
				case "Belgian":
			$li.append('<span class="natFlag"><img src="flags/Belgium.gif" /></span>');
			break;
		case "Belizean":
			$li.append('<span class="natFlag"><img src="flags/Beliz.gif" /></span>');
			break;
		case "Beninese":
			$li.append('<span class="natFlag"><img src="flags/Benin.gif" /></span>');
			break;
		case "Bermudian":
			$li.append('<span class="natFlag"><img src="flags/Bermuda.gif" /></span>');
			break;
		case "Bhutanese":
			$li.append('<span class="natFlag"><img src="flags/Bhutan.gif" /></span>');
			break;
		case "Bolivian":
			$li.append('<span class="natFlag"><img src="flags/Bolivia.gif" /></span>');
			break;
		case "Bosnian":
			$li.append('<span class="natFlag"><img src="flags/BosniaAndHerzegovina.gif" /></span>');
			break;
		case "Batswana":
			$li.append('<span class="natFlag"><img src="flags/Botswana.gif" /></span>');
			break;
		case "Brazilian":
			$li.append('<span class="natFlag"><img src="flags/Brazil.gif" /></span>');
			break;
		case "British":
			$li.append('<span class="natFlag"><img src="flags/UnitedKingdom.gif" /></span>');
			break;
		case "British Virgin Islanders":
			$li.append('<span class="natFlag"><img src="flags/BritishVirginIslands.gif" /></span>');
			break;
		case "Bruneian":
			$li.append('<span class="natFlag"><img src="flags/Brunei.gif" /></span>');
			break;
		case "Bulgarian":
			$li.append('<span class="natFlag"><img src="flags/Bulgaria.gif" /></span>');
			break;
		case "Burkinabe":
			$li.append('<span class="natFlag"><img src="flags/BurkinaFaso.gif" /></span>');
			break;
		case "Burmese":
			$li.append('<span class="natFlag"><img src="flags/Burma.gif" /></span>');
			break;
		case "Burundian":
			$li.append('<span class="natFlag"><img src="flags/Burundi.gif" /></span>');
			break;
		case "Cambodian":
			$li.append('<span class="natFlag"><img src="flags/Cambodia.gif" /></span>');
			break;
		case "Cameroonian":
			$li.append('<span class="natFlag"><img src="flags/Cameroon.gif" /></span>');
			break;
		case "Canadian":
			$li.append('<span class="natFlag"><img src="flags/Canada.gif" /></span>');
			break;
		case "Cape Verdian":
			$li.append('<span class="natFlag"><img src="flags/CapeVerdeIslands.gif" /></span>');
			break;
		case "Chadian":
			$li.append('<span class="natFlag"><img src="flags/Chad.gif" /></span>');
			break;
		case "Channel Islander":
			$li.append('<span class="natFlag"><img src="flags/Guernsey.gif" /></span>');
			break;
		case "Chilean":
			$li.append('<span class="natFlag"><img src="flags/Chile.gif" /></span>');
			break;
		case "Chinese":
			$li.append('<span class="natFlag"><img src="flags/China.gif" /></span>');
			break;
		case "Christmas Islander":
			$li.append('<span class="natFlag"><img src="flags/ChristmasIsland.gif" /></span>');
			break;
		case "Cocos Islander":
			$li.append('<span class="natFlag"><img src="flags/CocosIslands.gif" /></span>');
			break;
		case "Colombian":
			$li.append('<span class="natFlag"><img src="flags/Colombia.gif" /></span>');
			break;
		case "Congolese":
			$li.append('<span class="natFlag"><img src="flags/Congo.gif" /></span>');
			break;
		case "Congolese (DRC)":
			$li.append('<span class="natFlag"><img src="flags/DemocraticRepublicofCongo.gif" /></span>');
			break;
		case "Costa Rican":
			$li.append('<span class="natFlag"><img src="flags/CostaRica.gif" /></span>');
			break;
		case "Croat":
			$li.append('<span class="natFlag"><img src="flags/Croatia.gif" /></span>');
			break;
		case "Cuban":
			$li.append('<span class="natFlag"><img src="flags/Cuba.gif" /></span>');
			break;
		case "Cypriot":
			$li.append('<span class="natFlag"><img src="flags/Cyprus.gif" /></span>');
			break;
		case "Czech/Czechoslavakian":
			$li.append('<span class="natFlag"><img src="flags/CzechRepublic.gif" /></span>');
			break;
		case "Dane":
			$li.append('<span class="natFlag"><img src="flags/Denmark.gif" /></span>');
			break;
		case "Djibouti":
			$li.append('<span class="natFlag"><img src="flags/Djibouti.gif" /></span>');
			break;
		case "Dominican":
			$li.append('<span class="natFlag"><img src="flags/Dominica.gif" /></span>');
			break;
		case "Dominican (Republic)":
			$li.append('<span class="natFlag"><img src="flags/DominicanRepublic.gif" /></span>');
			break;
		case "Dutch":
			$li.append('<span class="natFlag"><img src="flags/Netherlands.gif" /></span>');
			break;
		case "East Timorese":
			$li.append('<span class="natFlag"><img src="flags/EastTimor.gif" /></span>');
			break;
		case "Ecuadorian":
			$li.append('<span class="natFlag"><img src="flags/Ecuador.gif" /></span>');
			break;
		case "Egyptian":
			$li.append('<span class="natFlag"><img src="flags/Egypt.gif" /></span>');
			break;
		case "Emirati":
			$li.append('<span class="natFlag"><img src="flags/UnitedArabEmirates.gif" /></span>');
			break;
		case "Equatorial Guinean":
			$li.append('<span class="natFlag"><img src="flags/EquatorialGuinea.gif" /></span>');
			break;
		case "Eritrean":
			$li.append('<span class="natFlag"><img src="flags/Eritrea.gif" /></span>');
			break;
		case "Estonian":
			$li.append('<span class="natFlag"><img src="flags/Estonia.gif" /></span>');
			break;
		case "Ethioian":
			$li.append('<span class="natFlag"><img src="flags/Ethiopia.gif" /></span>');
			break;
		case "Falkland Islander":
			$li.append('<span class="natFlag"><img src="flags/FalklandIslands.gif" /></span>');
			break;
		case "Faroese":
			$li.append('<span class="natFlag"><img src="flags/FaroeIslands.gif" /></span>');
			break;
		case "Fijian":
			$li.append('<span class="natFlag"><img src="flags/Fiji.gif" /></span>');
			break;
		case "Filipino":
			$li.append('<span class="natFlag"><img src="flags/Philippines.gif" /></span>');
			break;
		case "Finn":
			$li.append('<span class="natFlag"><img src="flags/Finland.gif" /></span>');
			break;
		case "French":
			$li.append('<span class="natFlag"><img src="flags/France.gif" /></span>');
			break;
		case "French Guianese":
			$li.append('<span class="natFlag"><img src="flags/FrenchGuiana.gif" /></span>');
			break;
		case "Gambian":
			$li.append('<span class="natFlag"><img src="flags/Gambia.gif" /></span>');
			break;
		case "Georgian":
			$li.append('<span class="natFlag"><img src="flags/Georgia.gif" /></span>');
			break;
		case "German":
			$li.append('<span class="natFlag"><img src="flags/Germany.gif" /></span>');
			break;
		case "Ghanaian":
			$li.append('<span class="natFlag"><img src="flags/Ghana.gif" /></span>');
			break;
		case "Gibraltarian":
			$li.append('<span class="natFlag"><img src="flags/Gibraltar.gif" /></span>');
			break;
		case "Greek":
			$li.append('<span class="natFlag"><img src="flags/Greece.gif" /></span>');
			break;
		case "Greenlander":
			$li.append('<span class="natFlag"><img src="flags/Greenland.gif" /></span>');
			break;
		case "Grenadan":
			$li.append('<span class="natFlag"><img src="flags/Grenada.gif" /></span>');
			break;
		case "Guadeloupean":
			$li.append('<span class="natFlag"><img src="flags/Guadeloupe.gif" /></span>');
			break;
		case "Guinean":
			$li.append('<span class="natFlag"><img src="flags/Guinea.gif" /></span>');
			break;
		case "Guinea-Bissauan":
			$li.append('<span class="natFlag"><img src="flags/GuineaBissau.gif" /></span>');
			break;
		case "Guyanese":
			$li.append('<span class="natFlag"><img src="flags/Guyana.gif" /></span>');
			break;
		case "Haitian":
			$li.append('<span class="natFlag"><img src="flags/Haiti.gif" /></span>');
			break;
		case "Honduran":
			$li.append('<span class="natFlag"><img src="flags/Honduras.gif" /></span>');
			break;
		case "Hong Kong Chinese":
			$li.append('<span class="natFlag"><img src="flags/HongKong.gif" /></span>');
			break;
		case "Hungarian":
			$li.append('<span class="natFlag"><img src="flags/Hungary.gif" /></span>');
			break;
		case "Icelander":
			$li.append('<span class="natFlag"><img src="flags/Iceland.gif" /></span>');
			break;
		case "Indian":
			$li.append('<span class="natFlag"><img src="flags/India.gif" /></span>');
			break;
		case "Indonesian":
			$li.append('<span class="natFlag"><img src="flags/Indonesia.gif" /></span>');
			break;
		case "Iranian":
			$li.append('<span class="natFlag"><img src="flags/Iran.gif" /></span>');
			break;
		case "Iraqi":
			$li.append('<span class="natFlag"><img src="flags/Iraq.gif" /></span>');
			break;
		case "Irish":
			$li.append('<span class="natFlag"><img src="flags/Ireland.gif" /></span>');
			break;
		case "Israeli":
			$li.append('<span class="natFlag"><img src="flags/Israel.gif" /></span>');
			break;
		case "Italian":
			$li.append('<span class="natFlag"><img src="flags/Italy.gif" /></span>');
			break;
		case "Ivorian":
			$li.append('<span class="natFlag"><img src="flags/CotedIvoire.gif" /></span>');
			break;
		case "Jamaican":
			$li.append('<span class="natFlag"><img src="flags/Jamaica.gif" /></span>');
			break;
		case "Japanese":
			$li.append('<span class="natFlag"><img src="flags/Japan.gif" /></span>');
			break;
		case "Jordanian":
			$li.append('<span class="natFlag"><img src="flags/Jordan.gif" /></span>');
			break;
		case "Kazakhstani":
			$li.append('<span class="natFlag"><img src="flags/Kazakhstan.gif" /></span>');
			break;
		case "Kenyan":
			$li.append('<span class="natFlag"><img src="flags/Kenya.gif" /></span>');
				break;
		case "Kiribati":
			$li.append('<span class="natFlag"><img src="flags/Kiribati.gif" /></span>');
			break;
		case "Kittian/Nevisian":
			$li.append('<span class="natFlag"><img src="flags/SaintKittsAndNevis.gif" /></span>');
			break;
		case "Korean, North":
			$li.append('<span class="natFlag"><img src="flags/KoreaNorth.gif" /></span>');
			break;
		case "Korean, South":
			$li.append('<span class="natFlag"><img src="flags/KoreaSouth.gif" /></span>');
			break;
		case "Kuwaiti":
			$li.append('<span class="natFlag"><img src="flags/Kuwait.gif" /></span>');
			break;
		case "Kyrgyz":
			$li.append('<span class="natFlag"><img src="flags/Kyrgyzstan.gif" /></span>');
			break;
		case "Laotian":
			$li.append('<span class="natFlag"><img src="flags/Laos.gif" /></span>');
			break;
		case "Latvian":
			$li.append('<span class="natFlag"><img src="flags/Latvia.gif" /></span>');
			break;
		case "Lebanese":
			$li.append('<span class="natFlag"><img src="flags/Lebanon.gif" /></span>');
			break;
		case "Lesotho":
			$li.append('<span class="natFlag"><img src="flags/Lesotho.gif" /></span>');
			break;
		case "Liberian":
			$li.append('<span class="natFlag"><img src="flags/Liberia.gif" /></span>');
			break;
		case "Libyan":
			$li.append('<span class="natFlag"><img src="flags/Libya.gif" /></span>');
			break;
		case "Liechtensteiner":
			$li.append('<span class="natFlag"><img src="flags/Liechtenstein.gif" /></span>');
			break;
		case "Lithuanian":
			$li.append('<span class="natFlag"><img src="flags/Lithuania.gif" /></span>');
			break;
		case "Luxembourger":
			$li.append('<span class="natFlag"><img src="flags/Luxembourg.gif" /></span>');
			break;
		case "Macaun":
			$li.append('<span class="natFlag"><img src="flags/Macao.gif" /></span>');
			break;
		case "Macedonian":
			$li.append('<span class="natFlag"><img src="flags/Macedonia.gif" /></span>');
			break;
		case "Madagasy":
			$li.append('<span class="natFlag"><img src="flags/Madagascar.gif" /></span>');
			break;
		case "Madeiran":
			$li.append('<span class="natFlag"><img src="flags/Madeira.gif" /></span>');
			break;
		case "Mahorais":
			$li.append('<span class="natFlag"><img src="flags/Mayotte.gif" /></span>');
			break;
		case "Malawian":
			$li.append('<span class="natFlag"><img src="flags/Malawi.gif" /></span>');
			break;
		case "Malaysian":
			$li.append('<span class="natFlag"><img src="flags/Malaysia.gif" /></span>');
			break;
		case "Maldivian":
			$li.append('<span class="natFlag"><img src="flags/Maldives.gif" /></span>');
			break;
		case "Malian":
			$li.append('<span class="natFlag"><img src="flags/Malaysia.gif" /></span>');
			break;
		case "Maltese":
			$li.append('<span class="natFlag"><img src="flags/Malta.gif" /></span>');
			break;
		case "Manx":
			$li.append('<span class="natFlag"><img src="flags/IsleofMan.gif" /></span>');
			break;
		case "Marshallese":
			$li.append('<span class="natFlag"><img src="flags/MarshallIslands.gif" /></span>');
			break;
		case "Martinican":
			$li.append('<span class="natFlag"><img src="flags/Martinique.gif" /></span>');
			break;
		case "Mauritanian":
			$li.append('<span class="natFlag"><img src="flags/Mauritania.gif" /></span>');
			break;
		case "Mauritian":
			$li.append('<span class="natFlag"><img src="flags/Maritius.gif" /></span>');
			break;
		case "Mexican":
			$li.append('<span class="natFlag"><img src="flags/Mexico.gif" /></span>');
			break;
		case "Micronesian":
			$li.append('<span class="natFlag"><img src="flags/Micronesia.gif" /></span>');
			break;
		case "Maldovan":
			$li.append('<span class="natFlag"><img src="flags/Maldova.gif" /></span>');
			break;
		case "Monacan":
			$li.append('<span class="natFlag"><img src="flags/Monaco.gif" /></span>');
			break;
		case "Mongolian":
			$li.append('<span class="natFlag"><img src="flags/Mongolia.gif" /></span>');
			break;
		case "Montserratian":
			$li.append('<span class="natFlag"><img src="flags/Montserrat.gif" /></span>');
			break;
		case "Montenegro":
			$li.append('<span class="natFlag"><img src="flags/Montenegro.gif" /></span>');
			break;
		case "Moroccan":
			$li.append('<span class="natFlag"><img src="flags/Morocco.gif" /></span>');
			break;
		case "Mozambican":
			$li.append('<span class="natFlag"><img src="flags/Mozambique.gif" /></span>');
			break;
		case "Namibian":
			$li.append('<span class="natFlag"><img src="flags/Namibia.gif" /></span>');
			break;
		case "Nauruan":
			$li.append('<span class="natFlag"><img src="flags/Nauru.gif" /></span>');
			break;
		case "Nepalese":
			$li.append('<span class="natFlag"><img src="flags/Nepal.gif" /></span>');
			break;
		case "New Zealander":
			$li.append('<span class="natFlag"><img src="flags/NewZealand.gif" /></span>');
			break;
		case "Nicaraguan":
			$li.append('<span class="natFlag"><img src="flags/Nucaragua.gif" /></span>');
			break;
		case "Nigerian":
			$li.append('<span class="natFlag"><img src="flags/Nigeria.gif" /></span>');
			break;
		case "Norwegian":
			$li.append('<span class="natFlag"><img src="flags/Norway.gif" /></span>');
			break;
		case "Omani":
			$li.append('<span class="natFlag"><img src="flags/Oman.gif" /></span>');
			break;
		case "Pakistani":
			$li.append('<span class="natFlag"><img src="flags/Pakistan.gif" /></span>');
			break;
		case "Palauan":
			$li.append('<span class="natFlag"><img src="flags/Palau.gif" /></span>');
			break;
		case "Palestinian":
			$li.append('<span class="natFlag"><img src="flags/Palestine.gif" /></span>');
			break;
		case "Panamanian":
			$li.append('<span class="natFlag"><img src="flags/Panama.gif" /></span>');
			break;
		case "Papua New Guinean":
			$li.append('<span class="natFlag"><img src="flags/PapuaNewGuinea.gif" /></span>');
			break;
		case "Paraguayan":
			$li.append('<span class="natFlag"><img src="flags/Paraguay.gif" /></span>');
			break;
		case "Peruvian":
			$li.append('<span class="natFlag"><img src="flags/Peru.gif" /></span>');
			break;
		case "Pole":
			$li.append('<span class="natFlag"><img src="flags/Poland.gif" /></span>');
			break;
		case "Portuguese":
			$li.append('<span class="natFlag"><img src="flags/Portugal.gif" /></span>');
			break;
		case "Puerto Rican":
			$li.append('<span class="natFlag"><img src="flags/PuertoRico.gif" /></span>');
			break;
		case "Qatari":
			$li.append('<span class="natFlag"><img src="flags/Qatar.gif" /></span>');
			break;
		case "Reunionese":
			$li.append('<span class="natFlag"><img src="flags/Reunion.gif" /></span>');
			break;
		case "Romanian":
			$li.append('<span class="natFlag"><img src="flags/Romania.gif" /></span>');
			break;
		case "Russian":
			$li.append('<span class="natFlag"><img src="flags/Russia.gif" /></span>');
			break;
		case "Rwandan":
			$li.append('<span class="natFlag"><img src="flags/Rwanda.gif" /></span>');
			break;
		case "Salvadorian":
			$li.append('<span class="natFlag"><img src="flags/ElSalvador.gif" /></span>');
			break;
		case "Samoan":
			$li.append('<span class="natFlag"><img src="flags/Samoa.gif" /></span>');
			break;
		case "San Marinese":
			$li.append('<span class="natFlag"><img src="flags/SanMarino.gif" /></span>');
			break;
		case "Saudi Arabian":
			$li.append('<span class="natFlag"><img src="flags/SaudiArabia.gif" /></span>');
			break;
		case "Senegal":
			$li.append('<span class="natFlag"><img src="flags/Senegalese.gif" /></span>');
			break;
		case "Serbian":
			$li.append('<span class="natFlag"><img src="flags/Serbia.gif" /></span>');
			break;
		case "Seychellois":
			$li.append('<span class="natFlag"><img src="flags/Seychelles.gif" /></span>');
			break;
		case "Sierra Leonean":
			$li.append('<span class="natFlag"><img src="flags/SierraLeone.gif" /></span>');
			break;
		case "Singaporean":
			$li.append('<span class="natFlag"><img src="flags/Singapore.gif" /></span>');
			break;
		case "Slovak":
			$li.append('<span class="natFlag"><img src="flags/Slovakia.gif" /></span>');
			break;
		case "Slovene":
			$li.append('<span class="natFlag"><img src="flags/Slovenia.gif" /></span>');
			break;
		case "Solomon Islander":
			$li.append('<span class="natFlag"><img src="flags/SolomonIslands.gif" /></span>');
			break;
		case "Somali":
			$li.append('<span class="natFlag"><img src="flags/Somalia.gif" /></span>');
			break;
		case "South African":
			$li.append('<span class="natFlag"><img src="flags/SouthAfrica.gif" /></span>');
			break;
		case "Spaniard":
			$li.append('<span class="natFlag"><img src="flags/Spain.gif" /></span>');
			break;
		case "Sri Lankan":
			$li.append('<span class="natFlag"><img src="flags/SriLanka.gif" /></span>');
			break;
		case "St Helenian":
			$li.append('<span class="natFlag"><img src="flags/SaintHelena.gif" /></span>');
			break;
		case "St Lucian":
			$li.append('<span class="natFlag"><img src="flags/SaintLucia.gif" /></span>');
			break;
		case "St Vincentian":
			$li.append('<span class="natFlag"><img src="flags/SaintVincentAndGrenadines.gif" /></span>');
			break;
		case "Sudanese":
			$li.append('<span class="natFlag"><img src="flags/Sudan.gif" /></span>');
			break;
		case "Surinamer":
			$li.append('<span class="natFlag"><img src="flagsSuriname/.gif" /></span>');
			break;
		case "Swazi":
			$li.append('<span class="natFlag"><img src="flags/Swaziland.gif" /></span>');
			break;
		case "Swede":
			$li.append('<span class="natFlag"><img src="flags/Sweden.gif" /></span>');
			break;
		case "Swiss":
			$li.append('<span class="natFlag"><img src="flags/Switzerland.gif" /></span>');
			break;
		case "Syrian":
			$li.append('<span class="natFlag"><img src="flags/Syria.gif" /></span>');
			break;
		case "Tahitian":
			$li.append('<span class="natFlag"><img src="flags/Tahiti.gif" /></span>');
			break;
		case "Taiwanese":
			$li.append('<span class="natFlag"><img src="flags/Taiwan.gif" /></span>');
			break;
		case "Tajik":
			$li.append('<span class="natFlag"><img src="flags/Tajikistan.gif" /></span>');
			break;
		case "Tanzanian":
			$li.append('<span class="natFlag"><img src="flags/Tanzania.gif" /></span>');
			break;
		case "Thai":
			$li.append('<span class="natFlag"><img src="flags/Thailand.gif" /></span>');
			break;
		case "Togolese":
			$li.append('<span class="natFlag"><img src="flags/Togo.gif" /></span>');
			break;
		case "Tongan":
			$li.append('<span class="natFlag"><img src="flags/Tonga.gif" /></span>');
			break;
		case "Trinidadian":
			$li.append('<span class="natFlag"><img src="flags/TrinidadAndTobago.gif" /></span>');
			break;
		case "Tunisian":
			$li.append('<span class="natFlag"><img src="flags/Tunisia.gif" /></span>');
			break;
		case "Turk":
			$li.append('<span class="natFlag"><img src="flags/Turkey.gif" /></span>');
			break;
		case "Turkmen":
			$li.append('<span class="natFlag"><img src="flags/Turkmenistan.gif" /></span>');
			break;
		case "Turks & Caicos Islanders":
			$li.append('<span class="natFlag"><img src="flags/TurksAndCaicos.gif" /></span>');
			break;
		case "Tuvaluan":
			$li.append('<span class="natFlag"><img src="flags/Tuvalu.gif" /></span>');
			break;
		case "Ugandan":
			$li.append('<span class="natFlag"><img src="flags/Uganda.gif" /></span>');
			break;
		case "Ukrainian":
			$li.append('<span class="natFlag"><img src="flags/Ukraine.gif" /></span>');
			break;
		case "Uruguayan":
			$li.append('<span class="natFlag"><img src="flags/Uruguay.gif" /></span>');
			break;
		case "Uzbek":
			$li.append('<span class="natFlag"><img src="flags/Uzbekistan.gif" /></span>');
			break;
		case "Vanuatian":
			$li.append('<span class="natFlag"><img src="flags/Vanuatu.gif" /></span>');
			break;
		case "Venezuelan":
			$li.append('<span class="natFlag"><img src="flags/Venezuela.gif" /></span>');
			break;
		case "Vietnamnese":
			$li.append('<span class="natFlag"><img src="flags/Vietnam.gif" /></span>');
			break;
		case "Virgin Islander":
			$li.append('<span class="natFlag"><img src="flags/VirginIslands.gif" /></span>');
			break;
		case "Yemeni":
			$li.append('<span class="natFlag"><img src="flags/Yemen.gif" /></span>');
			break;
		case "Zambian":
			$li.append('<span class="natFlag"><img src="flags/Zambia.gif" /></span>');
			break;
		case "Zimbabwean":
			$li.append('<span class="natFlag"><img src="flags/Zimbabwe.gif" /></span>');
			break;
		default:
			$li.append('<span class="natFlag"><img src="flags/Pirate.gif" /></span>');
			break;
	} 			
	return $li;
}

// add new nationality to Nationality list
function addNat(text) {
	var text=$('#addNationality').val();
	if(!text){return;}
	
	var $li = $("<li class='ui-state-default'/>").text(text);
	$li.append('<span class="natFlag"><img src="flags/Pirate.gif" /></span>');
	$("#sortable1").append($li);
	$("#sortable1").sortable('refresh');
}
// add all nationalities from Added list
function addAllNat() {
	$("#sortable1 li").each(function() {
		$(this).appendTo('#sortable2');
	});
	$("#sortable1").sortable('refresh');
	$("#sortable2").sortable('refresh');
}
// clear all nationalities from Added list
function clearAllNat() {
	$("#sortable2 li").each(function() {
		$(this).appendTo('#sortable1');
	});
	$("#sortable1").sortable('refresh');
	$("#sortable2").sortable('refresh');

}

// check if user has entered correct format for inputs; display error if incorrect value entered
function checkFormatSec() {
	var secArr = new Array();
	secArr = getSec();

	// value has not entered the correct field format: positive integer
	if((!secArr[0])||(!secArr[1])||(!secArr[15])) {
		return 1; // no value entered
	} else if ((!($.isNumeric(secArr[0])))||(!($.isNumeric(secArr[1])))||(!($.isNumeric(secArr[15])))) {
		return 2; // value not numeric
	} else if ((secArr[0]<0)||(secArr[1]<0)||(secArr[15]<0)) {
		return 3; // value less than 0
	} 
	
	// ISPS Boundary 1&2 must be greater than ISPS Boundary 2&3
	if(parseInt(secArr[1]) <= parseInt(secArr[0])) {
		return 4; // ISPS 1&2 > ISPS 2&3
	} else if ((secArr[0]>(12*secArr[15]))||(secArr[1]>(12*secArr[15]))){
		return 5; // ISPS 1&2 or ISPS 2&3 > slider max
	}
	
	// Valid user inputs
	return 0;
}
function checkFormatSaf() {
	var safArr = new Array();
	safArr = getSaf();

	// value has not entered the correct field format: positive integer
	if((!safArr[0])||(!safArr[1])||(!safArr[18])) {
		return 1; // no value entered
	} else if ((!($.isNumeric(safArr[0])))||(!($.isNumeric(safArr[1])))||(!($.isNumeric(safArr[18])))) {
		return 2; // value not numeric
	} else if ((safArr[0]<0)||(safArr[1]<0)||(safArr[18]<0)) {
		return 3; // value less than 0
	} 
	
	// PSC Boundary 1&2 must be greater than PSC Boundary 2&3
	if(parseInt(safArr[1]) <= parseInt(safArr[0])) {
		return 4; // PSC 1&2 > PSC 2&3
	} else if ((safArr[0]>(16*safArr[18]))||(safArr[1]>(16*safArr[18]))){
		return 5; // PSC 1&2 or PSC 2&3 > slider max
	}
	
	// Valid user inputs
	return 0;
}
function checkFormatNat(str) {
	if(!str){
		return true;
	}
	return false;
}

// show summary page to allow users to commit and/or save settings 
function summary() {
	// get user inputs //
	var secArr = new Array();
	secArr = getSec();
	var safArr = new Array();
	safArr = getSaf();
	var mouStr = getMou();
	var natList = getNatList2();
	var natListStr = natList.join('\n');
	
	// check for valid user inputs
	$("#summary").html('<div class="blueTitle">RISK Settings Summary</div>');
	// check for valid user input for Security tab
	if(checkFormatSec()) {
		if(checkFormatSec()==1){
			$("#summary").append('<div class="errorLog">ERROR: Input(s) not filled in for Security.</div>');
			return;
		} 
		if(checkFormatSec()==2) {
			$("#summary").append('<div class="errorLog">ERROR: Inputs for Security must be numeric.</div>');
			return;
		} 
		if(checkFormatSec()==3) {
			$("#summary").append('<div class="errorLog">ERROR: Inputs for Security must be greater or equal to zero.</div>');
			return;
		} 
		if(checkFormatSec()==4) {
			$("#summary").append('<div class="errorLog">ERROR: ISPS Boundary 1&2 must be less than ISPS Boundary 2&3.</div>');
			return;
		} 
		if(checkFormatSec()==5) {
			$("#summary").append('<div class="errorLog">ERROR: ISPS Boundaries are out of bounds. Try a smaller value.</div>');
			return;
		}
	}
	// check for valid user input for Safety tab
	if(checkFormatSaf()) {
		if(checkFormatSaf()==1){
			$("#summary").append('<div class="errorLog">ERROR: Input(s) not filled in for Safety.</div>');
			return;
		} 
		if(checkFormatSaf()==2) {
			$("#summary").append('<div class="errorLog">ERROR: Inputs for Safety must be numeric.</div>');
			return;
		} 
		if(checkFormatSaf()==3) {
			$("#summary").append('<div class="errorLog">ERROR: Inputs for Safety must be greater or equal to zero.</div>');
			return;
		} 
		if(checkFormatSaf()==4) {
			$("#summary").append('<div class="errorLog">ERROR: PSC Boundary 1&2 must be less than PSC Boundary 2&3.</div>');
			return;
		} 
		if(checkFormatSaf()==5) {
			$("#summary").append('<div class="errorLog">ERROR: PSC Boundaries are out of bounds. Try a smaller value.</div>');
			return;
		}
	}
	// check for valid user input for Nationalities tab
	if(checkFormatNat(natListStr)){
		$("#summary").append('<div class="errorLog">Error: Nationalities List is blank.</div>');
		return;
	}
			
	$("#summary").html(
		// summarize user selected RISK settings
		'<div class="blueTitle">RISK Settings Summary</div>' +
		'<div>' +
			'<b>Security:</b><br />' +
			'<textarea rows="2" cols="50">' +
			'ISPS 1 and 2 Boundary: ' + secArr[0] + '\n' +
			'ISPS 2 and 3 Boundary: ' + secArr[1] + '\n' +
			'Company Security: ' + secArr[2] + '\n' +
			'Black Flag: ' + secArr[3] + '\n' +
			'Gray Flag: ' + secArr[4] + '\n' +
			'No ISPS Inspection: ' + secArr[5] + '\n' +
			'ISPS Inspection History: ' + secArr[6] + '\n' +
			'ISPS Detention: ' + secArr[7] + '\n' +	
			'ISPS Minor Control: ' + secArr[8] + '\n' +	
			'Nationalities Risk: ' + secArr[9] + '\n' +	
			'Insecure Port: ' + secArr[10] + '\n' +	
			'Port Not ISPS: ' + secArr[11] + '\n' +	
			'No Port History: ' + secArr[12] + '\n' +	
			'No Crew Data: ' + secArr[13] + '\n' + 
			'Allow ISPS Downgrade: ' + secArr[14] +
			'</textarea>' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div>' +
			'<b>Safety:</b><br />' +
			'<textarea rows="2" cols="50">' +
			'PSC 1 and 2 Boundary: ' + safArr[0] + '\n' +
			'PSC 2 and 3 Boundary: ' + safArr[1] + '\n' +
			'Company Safety: ' + safArr[2] + '\n' +
			'Black Flag: ' + safArr[3] + '\n' +
			'Gray Flag: ' + safArr[4] + '\n' +
			'High Class: ' + safArr[5] + '\n' +
			'Medium Class: ' + safArr[6] + '\n' +
			'Low Class: ' + safArr[7] + '\n' +
			'No PSC Inspection: ' + safArr[8] + '\n' +
			'PSC Detention: ' + safArr[9] + '\n' +
			'Other Control: ' + safArr[10] + '\n' +
			'Casualty/Pollution: ' + safArr[11] + '\n' +
			'Marine Violation: ' + safArr[12] + '\n' +
			'Tanker/Passenger: ' + safArr[13] + '\n' +
			'Age Less Than 10: ' + safArr[14] + '\n' +
			'Age 10 to 20: ' + safArr[15] + '\n' +
			'Age Greater Than 20: ' + safArr[16] + '\n' +
			'Multiple Admin Changes: ' + safArr[17] +
			'</textarea>' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div>' +
			'<b>MOU List:</b><br />' + 
			'<textarea rows="1" cols="50">' +
			mouStr +
			'</textarea>' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div>' +
			'<b>Nationalities List:</b><br />' + 
			'<textarea rows="2" cols="50">' +
			natListStr +
			'</textarea>' +
		'</div>' +
		// allow user to save RISK settings or request RISK score calculation
		'<div class="colClear">' +
			'<span class="customBtn"><button onclick="saveConfig();">Save</button></span>' +
			'<span class="customBtn"><button onclick="calculate();">Calculate</button></span><br /><br />' +
		'</div>'
	);
}
 
// write settings to DB and send request to recalculate RISK score 
function calculate() {
	// get variable values	
	var secBound1 = $("#secBound1").val();
	var secBound2 = $("#secBound2").val();
	var secCompany = $("#secSCompany").slider("value");
	var secBlackFlag = $("#secSBlackFlag").slider("value");
	var secGrayFlag = $("#secSGrayFlag").slider("value");
	var secNoInsp = $("#secSNoInsp").slider("value");
	var secInspHist = $("#secSInspHist").slider("value");
	var secDetention = $("#secSDetention").slider("value");
	var secMinorControl = $("#secSMinorControl").slider("value");
	var secNationality = $("#secSNationality").slider("value");
	var secInsPort = $("#secSInsPort").slider("value");
	var secPortNotISPS = $("#secSPortNotISPS").slider("value");
	var secNoPortHist = $("#secSNoPortHist").slider("value");
	var secCrew = $("#secSCrewData").slider("value");
	var secDowngrade = $("#secDowngrade").val();
	
	var safBound1 = $("#safBound1").val();
	var safBound2 = $("#safBound2").val();
	var safCompany = $("#safSCompany").slider("value");
	var safBlackFlag = $("#safSBlackFlag").slider("value");
	var safGrayFlag = $("#safSGrayFlag").slider("value");
	var safHighClass = $("#safSHighClass").slider("value");
	var safMedClass = $("#safSMedClass").slider("value");
	var safLowClass = $("#safSLowClass").slider("value");
	var safNoInsp = $("#safSNoInsp").slider("value");
	var safDetention = $("#safSDetention").slider("value");
	var safControl = $("#safSControl").slider("value");
	var safCasualty = $("#safSCasualty").slider("value");
	var safViolation = $("#safSViolation").slider("value");
	var safTankerPass = $("#safSTankerPass").slider("value");
	var safLt10 = $("#safSLt10").slider("value");
	var saf10to20 = $("#safS10to20").slider("value");
	var safGt20 = $("#safSGt20").slider("value");
	var safMultiAdmin = $("#safSMultiAdmin").slider("value");
		
	var mouList = $("#moulist").val();
	
	var natList = getNatList2();
			
	// write to risk database
	var phpWithArg = "query_risk.php?" +
		"secBound1=" + secBound1 +
		"&secBound2=" + secBound2 +
		"&secCompany=" + secCompany + 
		"&secBlackFlag="+ secBlackFlag + 
		"&secGrayFlag=" + secGrayFlag +
		"&secNoInsp=" + secNoInsp +
		"&secInspHist=" + secInspHist +
		"&secDetention=" + secDetention +
		"&secMinorControl=" + secMinorControl +
		"&secNationality=" + secNationality +
		"&secInsPort=" + secInsPort +
		"&secPortNotISPS=" + secPortNotISPS +
		"&secNoPortHist=" + secNoPortHist +
		"&secCrew=" + secCrew +
		"&secDowngrade=" + secDowngrade +
		"&safBound1=" + safBound1 +
		"&safBound2=" + safBound2 +
		"&safCompany=" + safCompany +
		"&safBlackFlag=" + safBlackFlag +
		"&safGrayFlag=" + safGrayFlag +
		"&safHighClass=" + safHighClass +
		"&safMedClass=" + safMedClass +
		"&safLowClass=" + safLowClass +
		"&safNoInsp=" + safNoInsp +
		"&safDetention=" + safDetention +
		"&safControl=" + safControl +
		"&safCasualty=" + safCasualty +
		"&safViolation=" + safViolation +
		"&safTankerPass=" + safTankerPass +
		"&safLt10=" + safLt10 +
		"&saf10to20=" + saf10to20 +
		"&safGt20=" + safGt20 +
		"&safMultiAdmin=" + safMultiAdmin +
		"&mouList=" + mouList;
	console.log('phpWithArg: ' + phpWithArg);
	
	$.getJSON(
		phpWithArg,
		function () {
		}
	).done(function (response) {
		console.log('RISK Config: ' + response.exectime);
	}).fail(function() {
		console.log('RISK Config: No response from database; error in php?');
		return;
	});
	
	// write to nationalities database
	
	// request to recalculate RISK scores
	
	// display RISK scores
	getRiskScores();
}

// display RISK scores
function getRiskScores() {
	var phpWithArg = "query_risk_results.php?user=usericode";
	
	$.getJSON(
		phpWithArg,
		function () {
		}
	).done(function (response) {
		$("#summary").html(
			'<div class="blueTitle">RISK Score Results</div>'
		);
		
		if (response.resultcount > 0) {
			$("#summary").append(
				'<div class="defClear">' +
				'<div class="resultImo" style="background:rgb(210,210,210);"><b>IMO<br />Number</b></div>' +
				'<div class="resultSecScore" style="background:rgb(210,210,210);"><b>Security<br />Score</b></div>' +
				'<div class="resultSecRating" style="background:rgb(210,210,210);"><b>Security<br />Rating</b></div>' +
				'<div class="resultSafScore" style="background:rgb(210,210,210);"><b>Safety<br />Score</b></div>' +
				'<div class="resultSafRating" style="background:rgb(210,210,210);"><b>Safety<br />Rating</b></div>' +	
				'</div>'
			);
			
			for (var i=0;i<response.resultcount;i++) {
				$("#summary").append(
					'<div class="defClear">' +
					'<div class="resultImo">' + response.vesseldata[i].imo + '</div>' +
					'<div class="resultSecScore">' + response.vesseldata[i].secScore + '</div>' +
					'<div class="resultSecRating">' + response.vesseldata[i].secRating + '</div>' +
					'<div class="resultSafScore">' + response.vesseldata[i].safScore + '</div>' +
					'<div class="resultSafRating">' + response.vesseldata[i].safRating + '</div>' +
					'</div>'
				);
			}
		} else {
			$("#summary").append('No results found.');
		}
	}).fail(function() {
		console.log('RISK Config: No response from database; error in php?');
		return;
	});
}
 
// save RISK settings to call up later; saved entries found under History tab.
function saveConfig() {
	var secArr = new Array(
		$("#secSCompany").slider("value"),
		$("#secSBlackFlag").slider("value"),
		$("#secSGrayFlag").slider("value"),
		$("#secSNoInsp").slider("value"),
		$("#secSInspHist").slider("value"),
		$("#secSDetention").slider("value")	,
		$("#secSMinorControl").slider("value"),
		$("#secSNationality").slider("value"),
		$("#secSInsPort").slider("value"),
		$("#secSPortNotISPS").slider("value"),
		$("#secSNoPortHist").slider("value"),	
		$("#secSCrewData").slider("value"),
		$("#secDowngrade").val(),
		$('#secSliderMax').val(),
		$("#secBound1").val(),
		$("#secBound2").val()
	);
	var safArr = new Array(	
		$("#safSCompany").slider("value"),
		$("#safSBlackFlag").slider("value"),
		$("#safSGrayFlag").slider("value"),
		$("#safSHighClass").slider("value"),
		$("#safSMedClass").slider("value"),
		$("#safSLowClass").slider("value"),
		$("#safSNoInsp").slider("value"),
		$("#safSDetention").slider("value"),
		$("#safSControl").slider("value"),
		$("#safSCasualty").slider("value"),
		$("#safSViolation").slider("value"),
		$("#safSTankerPass").slider("value"),
		$("#safSLt10").slider("value"),
		$("#safS10to20").slider("value"),
		$("#safSGt20").slider("value"),
		$("#safSMultiAdmin").slider("value"),
		$('#safSliderMax').val(),
		$("#safBound1").val(),
		$("#safBound2").val()
	);
	var mouArr = $("#moulist").val();
	var natArr1 = getNatList1();
	var natArr2 = getNatList2();

	// store RISK settings from sliders in array
	riskSec[riskSize] = secArr;
	riskSaf[riskSize] = safArr;
	riskMou[riskSize] = mouArr;
	riskNat1[riskSize] = natArr1;
	riskNat2[riskSize] = natArr2;

	// prompt user to name entry
	var name = "";
	while(!name) {
		name = prompt("Please enter a new name for the entry");
		for(var i=0;i<riskSize;i++){
			if(name == riskName[i]){
				name = "";
			}
		}
	}
	riskName[riskSize] = name;
	
	// increase saved entries size by one
	riskSize++;		

	// show History tab
	$('#historytab').click();
}
 
// show saved RISK settings
function history() {
	// show message if no saved entries exists
	if(riskSize<1){
		$('#history').html('<div class="blueTitle">Saved Entries</div>No entries found.');
		return;
	}
	
	// otherwise, show saved entries
	$('#history').html('<div class="blueTitle">Saved Entries</div>');
	for(var i=0;i<riskSize;i++) {
		$('#history').append(
			'<div class="slider-container">' +
			'<div class="sub-left" style="font-size:1em;color:rgb(0,0,0);">' +
			(i+1) + '. ' + riskName[i] + 
			'</div>' +
			'<div class="sub-right" style="font-size:1em;color:rgb(0,0,0);">' +
			'<span class="customBtn"><button onclick="loadHistory(' + i + ');">Load</button></span>' +
			'<span class="customBtn"><button onclick="renameHistory(' + i + ');">Rename</button></span>' +
			'<span class="customBtn"><button onclick="removeHistory(' + i + ');">Remove</button></span>' +
			'</div></div>'
		);
	}
} 

// load saved RISK entry
function loadHistory(idx) {
	var secArr = riskSec[idx];
	var safArr = riskSaf[idx];
	var mouArr = riskMou[idx];
	var natArr1 = riskNat1[idx];
	var natArr2 = riskNat2[idx];
	
	setSecurity(secArr);
	setSafety(safArr);
	setMou(mouArr);
	setNat1(natArr1);
	setNat2(natArr2);
	
	$('#secSliderMax').val(secArr[13]);
	$("#secBound1").val(secArr[14]);
	$("#secBound2").val(secArr[15]);
	$('#safSliderMax').val(safArr[16]);
	$("#safBound1").val(safArr[17]);
	$("#safBound2").val(safArr[18]);	
	
	// show updated settings in summary tab
	$('#summarytab').click();
}
// rename saved RISK entry
function renameHistory(idx){
	var name = "";
	
	while(!name) {
		name = prompt("Please enter name for entry.");
	}
	riskName[idx] = name;
	
	history();
}
// remove saved RISK entry
function removeHistory(idx){
	// decrease size of saved entries
	riskSize -= 1;
	
	// remove entry and reshape array if needed
	if(idx != riskSize) {
		for(var i=idx;i<riskSize;i++){
			riskName[i] = riskName[i+1];
			riskSec[i] = riskSec[i+1];
			riskSaf[i] = riskSaf[i+1];
			riskMou[i] = riskMou[i+1];
			riskNat1[i] = riskNat1[i+1];
			riskNat2[i] = riskNat2[i+1];
		}
	}
	riskName[riskSize] = null;
	riskSec[riskSize] = null;
	riskSaf[riskSize] = null;
	riskMou[riskSize] = null;
	riskNat1[riskSize] = null;
	riskNat2[riskSize] = null;
	
	// refresh list
	history();
}
