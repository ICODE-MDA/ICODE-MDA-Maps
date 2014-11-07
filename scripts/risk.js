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
var riskSize = 0;

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
	"Nationalitites Risk",
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
	"Points assessed if there have been 5 or fewer ISPS inspections within the past 3 years",
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
	"Threhold for safety risk score that recommends that the vessel be inspected while in port.",
	"Points assessed if the owner/operator/manager of a vessel is on the targeted (black) list for safety",
	"Points assessed if the vessel's country of registry appears on the targeted (black) flag state list for safety.",
	"Points assessed if the vessel's country of registry appears on the targeted (gray) flag state list for safety.",
	"Points assessed if the vessel's classification society appears in the targeted (high) list for safety.",
	"Points assessed if the vessel's classification society appears in the targeted (medium) list for safety",
	"Points assessed if the vessel's classification society appears in the targeted (low) list for safety",
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
 
// set default settings to sliders 
function setDefaultSecurity() {
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
	$('#safSliderMax').val('7');
	setSafSliderMax();
	
	var safArr = new Array(5,7,2,1,2,3,7,7,7,7,7,7,7,7,7,7);
	setSafety(safArr);
	
	$('#safSliderMax').val('7');
	setSafSliderMax();
	$("#safBound1").val('14');
	$("#safBound2").val('21');
}

// set new maximum value for sliders
function setSecSliderMax() {
	var val = $('#secSliderMax').val();

	// SECURITY
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
}
function setSafSliderMax() {
	var val = $('#safSliderMax').val();
	
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
}

// set settings for sliders
function setSecurity(arr) {
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
	$("#moulist").val(str);
}

// show summary page to allow users to commit and/or save settings 
function summary() {
//	$("input:checkbox[name=type]:checked").each(function() {
//		// add $(this).val() to your array
//	});
	
	$("#summary").html(
		// summarize user selected RISK settings
		'<div class="blueTitle">RISK Settings Summary</div>' +
		'<div class="colLeft">' +
			'<b><u>Security</u></b><br />' +
			'ISPS 1 and 2 Boundary: ' + $("#secBound1").val() + '<br />' +
			'ISPS 2 and 3 Boundary: ' + $("#secBound2").val() + '<br />' +
			'Company Security: ' + $("#secSCompany").slider("value") + '<br />' +
			'Black Flag: ' + $("#secSBlackFlag").slider("value") + '<br />' +
			'Gray Flag: ' + $("#secSGrayFlag").slider("value") + '<br />' +
			'No ISPS Inspection: ' + $("#secSNoInsp").slider("value") + '<br />' +
			'ISPS Inspection History: ' + $("#secSInspHist").slider("value") + '<br />' +
			'ISPS Detention: ' + $("#secSDetention").slider("value") + '<br />' +	
			'ISPS Minor Control: ' + $("#secSMinorControl").slider("value") + '<br />' +	
			'Nationalities Risk: ' + $("#secSNationality").slider("value") + '<br />' +	
			'Insecure Port: ' + $("#secSInsPort").slider("value") + '<br />' +	
			'Port Not ISPS: ' + $("#secSPortNotISPS").slider("value") + '<br />' +	
			'No Port History: ' + $("#secSNoPortHist").slider("value") + '<br />' +	
			'No Crew Data: ' + $("#secSCrewData").slider("value") + '<br />' + 
			'Allow ISPS Downgrade: ' + $("#secDowngrade option:selected").text() + '<br /><br />' +
			'<b><u>MOU List</u></b><br />' + 
			$('#moulist option:selected').text() + '<br /><br />' +	
		'</div>' +
		'<div class="colRight">' +
			'<b><u>Safety</u></b><br />' +
			'PSC 1 and 2 Boundary: ' + $("#safBound1").val() + '<br />' +
			'PSC 2 and 3 Boundary: ' + $("#safBound2").val() + '<br />' +
			'Company Safety: ' + $("#safSCompany").slider("value") + '<br />' +
			'Black Flag: ' + $("#safSBlackFlag").slider("value") + '<br />' +
			'Gray Flag: ' + $("#safSGrayFlag").slider("value") + '<br />' +
			'High Class: ' + $("#safSHighClass").slider("value") + '<br />' +
			'Medium Class: ' + $("#safSMedClass").slider("value") + '<br />' +
			'Low Class: ' + $("#safSLowClass").slider("value") + '<br />' +
			'No PSC Inspection: ' + $("#safSNoInsp").slider("value") + '<br />' +
			'PSC Detention: ' + $("#safSDetention").slider("value") + '<br />' +
			'Other Control: ' + $("#safSControl").slider("value") + '<br />' +
			'Casualty/Pollution: ' + $("#safSCasualty").slider("value") + '<br />' +
			'Marine Violation: ' + $("#safSViolation").slider("value") + '<br />' +
			'Tanker/Passenger: ' + $("#safSTankerPass").slider("value") + '<br />' +
			'Age Less Than 10: ' + $("#safSLt10").slider("value") + '<br />' +
			'Age 10 to 20: ' + $("#safS10to20").slider("value") + '<br />' +
			'Age Greater Than 20: ' + $("#safSGt20").slider("value") + '<br />' +
			'Multiple Admin Changes: ' + $("#safSMultiAdmin").slider("value") + '<br /><br />' +
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
			
	// write to database
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
	var name = "";
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

	// store RISK settings from sliders in array
	riskSec[riskSize] = secArr;
	riskSaf[riskSize] = safArr;
	riskMou[riskSize] = mouArr;

	// prompt user to name entry
	while(!name) {
		name = prompt("Please enter name for entry.");
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
	
	setSecurity(secArr);
	setSafety(safArr);
	setMou(mouArr);
	
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
		}
	}
	riskName[riskSize] = null;
	riskSec[riskSize] = null;
	riskSaf[riskSize] = null;
	riskMou[riskSize] = null;
	
	// refresh list
	history();
}


