/**
 * @name searchgui.js
 * @author Julie Luu
 * @fileoverview
 * Script to build MySQL queries from user selected preferences and search terms
 */

 /* -------------------------------------------------------------------------------- */
/**
 *  Global Variables
 */
var searchQuery = ""; 	// search query string

/*
// 	OWF: broadcast query to maps widget
 */
function sendQueryToMap(str) {
	OWF.Eventing.publish("queryBuilderToMap", str);
}

/*
// trigger click event to search when 'Enter' key pressed in search bar
 */
$(document).keypress(function(e) {
	if (e.which == 13) {
		// print what you are searching for in document
		searchguiResults();
	}
});

/*
// 	On page load, set default settings in input elements
 */
function initialize() {
	/*
	 / set default value for date-time range
	 */
	
	// get current time in unix timestamp; set default date-time range to 30mins prior to now.
	var maxTime = Math.round((new Date()).getTime() / 1000);
	var minTime = maxTime - (60*60*0.5);
	
	// convert to date-time format
	var dtMaxTime = " " + new Date(maxTime*1000);
	var dtMinTime = " " + new Date(minTime*1000);
	
	// parse date-time to extract individual time elements: month, day, year, hour, minute, and second.
	var splitMaxTime = dtMaxTime.split(" ");
	var splitMaxTime2 = splitMaxTime[5].split(":");
	if (splitMaxTime[2] == "Jan") {
		$('#maxMonth').val("01");
	} else if (splitMaxTime[2] == "Feb") {
		$('#maxMonth').val("02");
	} else if (splitMaxTime[2] == "Mar") {
		$('#maxMonth').val("03");
	} else if (splitMaxTime[2] == "Apr") {
		$('#maxMonth').val("04");
	} else if (splitMaxTime[2] == "May") {
		$('#maxMonth').val("05");
	} else if (splitMaxTime[2] == "Jun") {
		$('#maxMonth').val("06");
	} else if (splitMaxTime[2] == "Jul") {
		$('#maxMonth').val("07");
	} else if (splitMaxTime[2] == "Aug") {
		$('#maxMonth').val("08");
	} else if (splitMaxTime[2] == "Sep") {
		$('#maxMonth').val("09");
	} else if (splitMaxTime[2] == "Oct") {
		$('#maxMonth').val("10");
	} else if (splitMaxTime[2] == "Nov") {
		$('#maxMonth').val("11");
	} else if (splitMaxTime[2] == "Dec") {
		$('#maxMonth').val("12");
	}
	$('#maxDay').val(splitMaxTime[3]);
	$('#maxYear').val(splitMaxTime[4]);
	$('#maxHour').val(splitMaxTime2[0]);
	$('#maxMinute').val(splitMaxTime2[1]);
	$('#maxSecond').val(splitMaxTime2[2]);
	
	var splitMinTime = dtMinTime.split(" ");
	var splitMinTime2 = splitMinTime[5].split(":");
	if (splitMinTime[2] == "Jan") {
		$('#minMonth').val("01");
	} else if (splitMinTime[2] == "Feb") {
		$('#minMonth').val("02");
	} else if (splitMinTime[2] == "Mar") {
		$('#minMonth').val("03");
	} else if (splitMinTime[2] == "Apr") {
		$('#minMonth').val("04");
	} else if (splitMinTime[2] == "May") {
		$('#minMonth').val("05");
	} else if (splitMinTime[2] == "Jun") {
		$('#minMonth').val("06");
	} else if (splitMinTime[2] == "Jul") {
		$('#minMonth').val("07");
	} else if (splitMinTime[2] == "Aug") {
		$('#minMonth').val("08");
	} else if (splitMinTime[2] == "Sep") {
		$('#minMonth').val("09");
	} else if (splitMinTime[2] == "Oct") {
		$('#minMonth').val("10");
	} else if (splitMinTime[2] == "Nov") {
		$('#minMonth').val("11");
	} else if (splitMinTime[2] == "Dec") {
		$('#minMonth').val("12");
	}
	$('#minDay').val(splitMinTime[3]);
	$('#minYear').val(splitMinTime[4]);
	$('#minHour').val(splitMinTime2[0]);
	$('#minMinute').val(splitMinTime2[1]);
	$('#minSecond').val(splitMinTime2[2]);
}

/* 
//	Gets user input from input elements and builds a string of those preferences
 */
function searchguiResults() {
	
	$('#queryString').html("");	// clear main query string
	$('#results').html("");		// clear display area for search results on document
	
	// get date-time values from input elements
	var minMonth = $('#minMonth').val();
	var minDay = $('#minDay').val();
	var minYear = $('#minYear').val();
	var minHour = $('#minHour').val();
	var minMinute = $('#minMinute').val();
	var minSecond = $('#minSecond').val();
	var maxMonth = $('#maxMonth').val();
	var maxDay = $('#maxDay').val();
	var maxYear = $('#maxYear').val();
	var maxHour = $('#maxHour').val();
	var maxMinute = $('#maxMinute').val();
	var maxSecond = $('#maxSecond').val();
	
	// check for valid user input
	if(($('#minLat').val()== "")||($('#maxLat').val()== "")||($('#minLon').val()== "")||($('#maxLon').val()== "")) {
		$('#queryString').html('<span class="errorLog">Error: geographic coordinates are missing.</span>');
		return;
	}
	if (!($.isNumeric($('#minLat').val()))){
		$('#queryString').html('<span class="errorLog">Error: minimum latitude is not a valid numeric value.</span>');
		return;
	}
	if (!($.isNumeric($('#maxLat').val()))){
		$('#queryString').html('<span class="errorLog">Error: maximum latitude is not a valid numeric value.</span>');
		return;
	}
	if (!($.isNumeric($('#minLon').val()))){
		$('#queryString').html('<span class="errorLog">Error: minimum longitude is not a valid numeric value.</span>');
		return;
	}
	if (!($.isNumeric($('#maxLon').val()))){
		$('#queryString').html('<span class="errorLog">Error: maximum longitude is not a valid numeric value.</span>');
		return;
	}
	if ((parseFloat($('#maxLat').val(), 10)) <= (parseFloat($('#minLat').val(), 10))){
		$('#queryString').html('<span class="errorLog">Error: maximum latitude must be larger than minimum latitude.</span>');
		return;
	}
	if ((parseFloat($('#maxLon').val(), 10)) <= (parseFloat($('#minLon').val(), 10))){
		$('#queryString').html('<span class="errorLog">Error: maximum latitude must be larger than minimum latitude.</span>');
		return;
	}
	if ( (!($.isNumeric(minMonth))) || (!($.isNumeric(minDay))) || (!($.isNumeric(minYear))) ||
		 (!($.isNumeric(minHour))) || (!($.isNumeric(minMinute))) || (!($.isNumeric(minSecond))) ||
		 (!($.isNumeric(maxMonth))) || (!($.isNumeric(maxDay))) || (!($.isNumeric(maxYear))) ||
		 (!($.isNumeric(maxHour))) || (!($.isNumeric(maxMinute))) || (!($.isNumeric(maxSecond)))
		){
		$('#queryString').html('<span class="errorLog">Error: input for date-time field is not a valid numeric value.</span>');
		console.log("See it");
		return;
	}
	if (minMonth>12) {
		$('#queryString').html('<span class="errorLog">Error: user input for date-time not a valid Month value.</span>');
		return;
	}
	if (minDay>31) {
		$('#queryString').html('<span class="errorLog">Error: user input for date-time not a valid Day value.</span>');
		return;
	}
	if (minHour>24) {
		$('#queryString').html('<span class="errorLog">Error: user input for date-time not a valid Hour value.</span>');
		return;
	}
	if (minMinute>60) {
		$('#queryString').html('<span class="errorLog">Error: user input for date-time not a valid Minute value.</span>');
		return;
	}
	if (minSecond>60) {
		$('#queryString').html('<span class="errorLog">Error: user input for date-time not a valid Second value.</span>');
		return;
	}
	if (minHour == 24) {
		$('#minMinute').val('00');
		$('#minSecond').val('00');
		minMinute = "00";
		minSecond = "00";
	}
	if (maxHour == 24) {
		$('#maxMinute').val('00');
		$('#maxSecond').val('00');
		maxMinute = "00";
		maxSecond = "00";
	}
	
	var maxTime = toTimestamp(maxYear, maxMonth, maxDay, maxHour, maxMinute, maxSecond);
	var minTime = toTimestamp(minYear, minMonth, minDay, minHour, minMinute, minSecond);
	if (maxTime < minTime) {
		$('#queryString').html('<span class="errorLog">Error: Ending Date-Time must be greater than or equal to Starting Date-Time</span>');
		return;
	}
	
	// format date-time to MM/DD/YYYY HH:MM:SS
	formatDatetime("minMonth", minMonth);
	formatDatetime("minDay", minDay);
	formatDatetimeYear("minYear", minYear);
	formatDatetime("minHour", minHour);
	formatDatetime("minMinute", minMinute);
	formatDatetime("minSecond", minSecond);
	formatDatetime("maxMonth", maxMonth);
	formatDatetime("maxDay", maxDay);
	formatDatetimeYear("maxYear", maxYear);
	formatDatetime("maxHour", maxHour);
	formatDatetime("maxMinute", maxMinute);
	formatDatetime("maxSecond", maxSecond);
	
	////////////////////////////////////
	// build search query from string //
	////////////////////////////////////
	var substring = "";		// search query substring
	var subtitle = "";		// subtitle for substring
	
	// add custom search terms to searchQuery string
	searchQuery = $('#searchguiQuery').val();
	if (searchQuery != "") {
		searchQuery = "Search Terms: +Custom Query Terms: " + searchQuery;
	} else {
		searchQuery = "Search Terms: +Custom Query Terms: none";
	}	
	
	// add geographic coordinates to searchQuery string
	var minLat = $('#minLat').val();
	var maxLat = $('#maxLat').val();
	var minLon = $('#minLon').val();
	var maxLon = $('#maxLon').val();
	substring = "+Latitude: " + minLat + "," + maxLat + "+Longitude: " + minLon + "," + maxLon;
	searchQuery += substring;
	
	// add date-time range to searchQuery string
	substring = "+Datetime: Between," + minMonth + "," + minDay + "," + minYear + "," + minHour + "," + minMinute + "," + minSecond + ","
	substring += "To," + maxMonth + "," + maxDay + "," + maxYear + "," + maxHour + "," + maxMinute + "," + maxSecond;
	searchQuery += substring;
	 
	// add table name to searchQuery string
	substring = "+Table: ";
	substring += $('#tableName').find(":selected").text();
	searchQuery += substring;
	 
	/*
	// add vessels memory to searchQuery string
	 
	var orderElId = ["#vmMMSI","#vmCommsID","#vmIMONumber","#vmCallSign","#vmName","#vmVesType","#vmCargo","#vmAISClass","#vmLength","#vmBeam","#vmDraft","#vmAntOffsetBow","#vmAntOffsetPort","#vmDestination","#vmETADest","#vmPosSource","#vmPosQuality","#vmFixDTG","#vmROT","#vmNavStatus","#vmSource","#vmTimeOfFix","#vmLatitude","#vmLongitude","#vmSOG","#vmHeading","#vmRxStnID","#vmCOG"];
	var orderDesc = ["MMSI","Communications ID","IMO Number","Call Sign","Vessel Name","Vessel Type","Cargo","AIS Class","Length","Beam","Draft","Antenna Offset Bow","Antenna Offset Port","Destination","ETA Destination","Position Source","Position Quality","Fix Date-Time Group","ROT","Navigation Status","Source","Time Of Fix","Latitude","Longitude","SOG","Heading","Rx Station ID","COG"];

	subtitle = "+Vessels Memory: ";
	substring = genSubstring(subtitle, orderElId, orderDesc);
	searchQuery = searchQuery + substring;
	
	/*
	// add RADAR/Laisic to searchQuery string
	 
	orderElId = ["#rlKeyColumn","#rlMsgType","#rlMmsi","#rlNavStatus","#rlROT","#rlSOG","#rlLon","#rlLat","#rlCOG","#rlTrueHeading","#rlDatetime","#rlImo","#rlVesName","#rlVesType","#rlLength","#rlShipWidth","#rlBow","#rlStern","#rlPort","#rlStarboard","rlDraught","#rlDestination","#rlCallSign","#rlPosAcc","#rlETA","#rlPosFixType","#rlStreamId","#rlTargetStatus","#rlTargetAcq","#rlTrkNum","#rlSourceId","#rlAISTime","#rlAISTrknum"];
	orderDesc = ["Key Column","Message Type","MMSI","Navigation Status","ROT","SOG","Longitude","Latitude","COG","True Heading","Date-Time","IMO Number","Vessel Name","Vessel Type","Length","Ship Width","Bow","Stern","Port","Starboard","Draught","Destination","Call Sign","Position Accuracy","Estimated Time of Arrival","Position Fix Type","Stream ID","Target Status","Target Acquisition","Track Number","Source ID","AIS Time","AIS Track Number"];

	subtitle = "+Radar/Laisic: ";
	substring = genSubstring(subtitle, orderElId, orderDesc);
	searchQuery = searchQuery + substring;
	
	/*
	// add PVOL to searchQuery string
	 
	orderElId = ["#pvolMMSI","#pvolCommsID","#pvolName","#pvolPosSource","#pvolSource","#pvolTimeOfFix","#pvolLat","#pvolLon","#pvolSOG","#pvolHeading","#pvolRxStnID","#pvolCOG","#pvolOpt1Tag","#pvolOpt1Val","#pvolOpt2Tag","#pvolOpt2Val","#pvolOpt3Tag","#pvolOpt3Val","#pvolOpt4Tag","#pvolOpt4Val"];
	orderDesc = ["MMSI","Communications ID","Name","Position Source","Source","Time Of Fix","Latitude","Longitude","SOG","Heading","Rx Station ID","COG","Option 1 Tag","Option 1 Value","Option 2 Tag","Option 2 Value","Option 3 Tag","Option 3 Value","Option 4 Tag","Option 4 Value"];

	subtitle = "+PVOL: ";
	substring = genSubstring(subtitle, orderElId, orderDesc);
	searchQuery = searchQuery + substring;
	*/
	

	// display the search string in search results div in document
	$('#queryString').html(searchQuery);
	
	// parse searchQuery string and build query sentence for MySQL database
	doQuerySearch(); 
	
	
	// get selected checkboxes from div
	//var selected = [];
	//$('#checkboxes input:checked').each(function() {
	//	selected.push($(this).attr('id'));
	//});
	
}

/*
//	parse searchQuery string and build query sentence for MySQL database
 */
function doQuerySearch() {
	// parse search query string
	var strSplit = searchQuery.split('+');
	var customQuerySplit = (strSplit[1].split(": "))[1].split(",");	// custom search terms	
	var latSplit = (strSplit[2].split(": "))[1].split(","); 		// latitude
	var lonSplit = (strSplit[3].split(": "))[1].split(",");			// longitude
	var dtimeSplit = (strSplit[4].split(": "))[1].split(",");	    // date-time
	var tableSplit = strSplit[5].split(": ")	    				// table
	//var vmSplit = (strSplit[5].split(": "))[1].split(","); 			// retrieve Vessels Memory cols
	
	// convert date-time format to unix timestamp
	var unixtimeMin = toTimestamp(dtimeSplit[3],dtimeSplit[1],dtimeSplit[2],dtimeSplit[4],dtimeSplit[5],dtimeSplit[6]);
	var unixtimeMax = toTimestamp(dtimeSplit[10],dtimeSplit[8],dtimeSplit[9],dtimeSplit[11],dtimeSplit[12],dtimeSplit[13]);
	
	// retrieve actual database table name from user selected table name
	var tableName = "";
	if (tableSplit[1] == "PVOL-PDM") {
		tableName = "icodemda.pvol_pdm_memory";
	} else if(tableSplit[1] == "RADAR/LAISIC") {
		tableName = "laisic.radar_laisic_output_mem_track_heads";
	} else {
		tableName = "icodemda.vessels_memory";
	}
	
	// build MySQL query sentence
	var qStr = "SELECT * ";
	if (customQuerySplit != "none") {
		// user input has custom search terms
		qStr += "FROM " + tableName + " VESSELS ";
		qStr += "WHERE Latitude BETWEEN " + latSplit[0] + " AND " + latSplit[1] +" ";
		qStr += "AND Longitude BETWEEN " + lonSplit[0] + " AND " + lonSplit[1] + " ";
		//qStr += "AND TimeOfFix BETWEEN " + unixtimeMin + " AND " + unixtimeMax + " ";
		qStr += "AND (MMSI like ('%" + customQuerySplit +"%') ";
		qStr += "OR IMONumber like ('%" + customQuerySplit +"%') ";
		qStr += "OR Name like ('%" + customQuerySplit +"%') ";
		qStr += "OR Destination like ('%" + customQuerySplit +"%') ";
		qStr += "OR CallSign like ('%" + customQuerySplit +"%') ";
		qStr += "OR RxStnID like ('%" + customQuerySplit +"%')) ";
		qStr += "ORDER BY VESSELS.MMSI";
	} else {
		// user input does not have custom search terms
		qStr += "FROM " + tableName + " VESSELS ";
		qStr += "WHERE Latitude BETWEEN " + latSplit[0] + " AND " + latSplit[1] +" ";
		qStr += "AND Longitude BETWEEN " + lonSplit[0] + " AND " + lonSplit[1] + " ";
		qStr += "AND TimeOfFix BETWEEN " + unixtimeMin + " AND " + unixtimeMax + " ";
		qStr += "ORDER BY VESSELS.MMSI";
	}
	console.log("QUERY BUILDER OUTPUT: " + qStr);
	
	// launch map widget if not launched
	launchMap();
	
	// send query to maps widget; maps will refresh
	sendQueryToMap(qStr);
}

/*
function selectAll(node) {
	// select all checkboxes in div element
	$('#' + node + ' :checkbox').prop("checked", true);
}

function clearAll(node) {
	// clear all checkboxes in div element
	$('#' + node + ' :checkbox').prop("checked", false);
}

function genSubstring(subtitle, ElIdArray, DescArray) {
	// generate substring to add to query String
	var substr = "";

	for (var i=0; i<ElIdArray.length; i++) {
		if ($(ElIdArray[i]).prop('checked')) {
			if (substr != "") {
				substr += "," + DescArray[i];
			} else {
				substr = DescArray[i];
			}
		}
	}
	
	if (substr == "") {
		substr = "none"
	};
		
	substr = subtitle + substr;
	
	return substr;
}
*/

/*
//	Launches maps widget if not already launched
 */
function launchMap() {
	OWF.Launcher.launch({
		universalName: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		guid: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		//universalName: '51a8fc83-c801-ee68-1b9f-facf8c3f7f0e',
		//guid: '51a8fc83-c801-ee68-1b9f-facf8c3f7f0e',
		title: 'ICODE-MDA Maps',
		launchOnlyIfClosed: true
	}, callback);
}
function callback() {
	// placeholder for LaunchMap function
}

/*
//	Formats date-time user input elements to add to queryString string: Month, Day, Hour, Minute, Second
 */
function formatDatetime(timeElName, timeElVal) {
	// if user input is not blank, less than 10 then add a leading zero
	if (timeElVal != "") {
		if (timeElVal < 10) {
			// limit character length to 2
			if ($('#'+timeElName).val().length < 2) {
				$('#'+timeElName).val("0"+timeElVal);
			}
		}
	}
}

/*
// Formats date-time user input elements to add to queryString string: Year
 */
function formatDatetimeYear(timeElName, timeElVal) {
	// if user input is not blank, less than 10 then add a leading zero
	if (timeElVal != "") {
		// limit character length to 4
		var numChars = $('#'+timeElName).val().length;
		if (numChars < 4) {
			var zeros = "";
			while(numChars < 4) {
				zeros = zeros + "0";
				numChars++;
			}
			$('#'+timeElName).val(zeros+timeElVal);
		}
	}
}

/*
// converts date-time format to unix timestamp
 */
function toTimestamp(year,month,day,hour,minute,second) {
	var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
	return Math.round(datum.getTime()/1000);
}

// displays table columns in Query Options>Tables
/*
$(function() {
	$('#tableName').change(function(){
		var data = $(this).val();
		if(data == "1") {
			$('#tableCols').html(''
				+'<p id="vesselsMemory">'
				+'<b>Vessel Memory:</b><br />'
				+'<input id="vmMmsi" type="checkbox">'
				+'MMSI<br />'
				+'<input id="vmCommsID" type="checkbox">'
				+'Communications ID<br />'
				+'<input id="vmIMONumber" type="checkbox">'
				+'IMO Number<br />'
				+'<input id="vmCallSign" type="checkbox">'
				+'Call Sign<br />'
				+'<input id="vmName" type="checkbox">'
				+'Vessel Name<br />'
				+'<input id="vmVesType" type="checkbox">'
				+'Vessel Type<br />'
				+'<input id="vmCargo" type="checkbox">'
				+'Cargo<br />'
				+'<input id="vmAISClass" type="checkbox">'
				+'AIS Class<br />'
				+'<input id="vmLength" type="checkbox">'
				+'Length<br />'
				+'<input id="vmBeam" type="checkbox">'
				+'Beam<br />'
				+'<input id="vmDraft" type="checkbox">'
				+'Draft<br />'
				+'<input id="vmAntOffsetBow" type="checkbox">'
				+'Antenna Offset Bow<br />'
				+'<input id="vmAntOffsetPort" type="checkbox">'
				+'Antenna Offset Port<br />'
				+'<input id="vmDestination" type="checkbox">'
				+'Destination<br />'
				+'<input id="vmETADest" type="checkbox">'
				+'ETA Destination<br />'
				+'<input id="vmPosSource" type="checkbox">'
				+'Position Source<br />'
				+'<input id="vmPosQuality" type="checkbox">'
				+'Position Quality<br />'
				+'<input id="vmFixDTG" type="checkbox">'
				+'Fix Date-Time Group<br />'
				+'<input id="vmROT" type="checkbox">'
				+'ROT<br />'
				+'<input id="vmNavStatus" type="checkbox">'
				+'Navigation Status<br />'
				+'<input id="vmSource" type="checkbox">'
				+'Source<br />'
				+'<input id="vmTimeOfFix" type="checkbox">'
				+'Time Of Fix<br />'
				+'<input id="vmLat" type="checkbox">'
				+'Latitude<br />'
				+'<input id="vmLon" type="checkbox">'
				+'Longitude<br />'
				+'<input id="vmSOG" type="checkbox">'
				+'SOG<br />'
				+'<input id="vmHeading" type="checkbox">'
				+'Heading<br />'
				+'<input id="vmRxStnID" type="checkbox">'
				+'Rx Station Id<br />'
				+'<input id="vmCOG" type="checkbox">'
				+'COG<br /><br />'
				+'<button id="selectAll" onClick="selectAll("vesselsMemory");">Select All</button>&nbsp;&nbsp;'
				+'<button id="clearAll" onClick="clearAll("vesselsMemory");">Clear All</button>'
				+'<br /><br />'
				+'</p>'
			+'');
		} else if(data == "2") {
			$('#tableCols').html('Laisic');
		} else if(data == "3") {
			$('#tableCols').html('PVOL');
		}
	});
			
	$('#tableName').val('1').trigger('change');
	$('#tableName').val('2').trigger('change');
	$('#tableName').val('3').trigger('change');
});
*/