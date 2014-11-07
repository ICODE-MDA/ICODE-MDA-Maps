/**
 * @name searchgui.js
 * @author Julie Luu
 * @fileoverview
 * Script to build MySQL query sentences from user selected preferences and search terms
 */

 /* -------------------------------------------------------------------------------- */
/**
 *  Global Variables
 */
// Main query string
var qStr = '';					// query sentence

// Saved Searches Array
var savedName = new Array();	// saved searches: name of query
var savedType = new Array();	// saved searches: table type
var savedString = new Array();	// saved searches: query value
var searchSize = 0;				// saved searches: max size of saved searches array

// Input Elements
var tableType = 0;				// table type: 1=PVOL, 2=LAISIC, 3=Vessels Memory
var tableName = '';				// table name
var minLat = '';				// latitude: min value (degrees)
var maxLat = '';				// latitude: max value (degrees)
var minLon = '';				// longitude: min value (degrees)
var maxLon = '';				// longitude: max value (degrees)
var minMonth = '';				// start date: month (MM)
var minDay = '';				// start date: day (DD)
var minYear = '';				// start date: year (YYYY)
var minHour = '';				// start time: hour (HH)
var minMinute = '';				// start time: minute (MM)
var minSecond = '';				// start time: second (SS)
var maxMonth = '';				// end date: month (MM)
var maxDay = '';				// end date: day (DD)
var maxYear = '';				// end date: year (YYYY)
var maxHour = '';				// end time: hour (HH)
var maxMinute = '';				// end time: minute (MM)
var maxSecond = '';				// end time: second (SS)
var minTime = '';				// start time: UNIX format
var maxTime = '';				// end time: UNIX format
var limit = '';					// limit (integer greater than zero)
var searchConstraint = '';		// constraint for search term
var searchTerm = '';			// search term string

// On page load, set default settings in input elements
function initialize() {
	// set default value for date-time range
	
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

//////////////////////////
// MAIN SEARCH FUNCTION //
//////////////////////////
function searchguiResults() { 
	$('#queryString').html("");	// clear display area for main query string
	$('#results').html("");		// clear display area for search results
	
	// format and check for valid input values
	if (checkFormat()) {
		return; // not valid inputs so exit search function
	}
	
	// set global variables
	setVar();
	
	// build SQL query sentence from query builder options
	var str2 = buildQuery();
	
	// get info from database and display
	getDBinfo(str2);
		
	// launch maps
	launchMaps();
	sendQueryToMap(qStr);
//	launchMaps().done(sendQueryToMap);
}

// get form elements; 	
// set global variables 
function setVar() {
	// table type and name
	tableType = $('#tableName').find(":selected").val();
	tableName = $('#tableName').find(":selected").text();
	
	// latitude and longitude
	minLat = $('#minLat').val();
	maxLat = $('#maxLat').val();
	minLon = $('#minLon').val();
	maxLon = $('#maxLon').val();
	
	// time in Date-Time format
	minMonth = $('#minMonth').val();
	minDay = $('#minDay').val();
	minYear = $('#minYear').val();
	minHour = $('#minHour').val();
	minMinute = $('#minMinute').val();
	minSecond = $('#minSecond').val();
	maxMonth = $('#maxMonth').val();
	maxDay = $('#maxDay').val();
	maxYear = $('#maxYear').val();
	maxHour = $('#maxHour').val();
	maxMinute = $('#maxMinute').val();
	maxSecond = $('#maxSecond').val();
	
	// time in UNIX Timestamp format
	minTime = toTimestamp(minYear,minMonth,minDay,minHour,minMinute,minSecond);
	maxTime = toTimestamp(maxYear,maxMonth,maxDay,maxHour,maxMinute,maxSecond);
	
	// limit
	limit = $('#limit').val();
	if ($('#searchguiLimitCheck').is(':checked')) {
		limit = $('#searchguiLimitText').val();
	} else {
		limit = 'unlimited';
	}
	
	// search term by constraint type
	searchConstraint = $('#searchguiConstraint').find(":selected").val();
	searchTerm = $('#searchguiQuery').val();
	if (searchTerm != "") {
		if (searchConstraint == 1) {
			// search term contains
			searchTerm = '%' + searchTerm + '%';
		} else if (searchConstraint == 3) {
			// search term begins with
			searchTerm = searchTerm + "%";
		} else if (searchConstraint == 4) {
			// search term ends with
			searchTerm = "%" + searchTerm;
		}
	}
}

// check user format for input elements: 
// return true (invalid format);		 
// return false (valid format)			 
function checkFormat() {
	var checkMinLat = $('#minLat').val();
	var checkMaxLat = $('#maxLat').val();
	var checkMinLon = $('#minLon').val();
	var checkMaxLon = $('#maxLon').val();
	var checkMinMonth = $('#minMonth').val();
	var checkMinDay = $('#minDay').val();
	var checkMinYear = $('#minYear').val();
	var checkMinHour = $('#minHour').val();
	var checkMinMinute = $('#minMinute').val();
	var checkMinSecond = $('#minSecond').val();
	var checkMaxMonth = $('#maxMonth').val();
	var checkMaxDay = $('#maxDay').val();
	var checkMaxYear = $('#maxYear').val();
	var checkMaxHour = $('#maxHour').val();
	var checkMaxMinute = $('#maxMinute').val();
	var checkMaxSecond = $('#maxSecond').val();
	var checkLimit = 'unlimited';
	
	// check for valid user input
	if((!checkMinLat)||(!checkMaxLat)||(!checkMinLon)||(!checkMaxLon)) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Geographic coordinates are missing.</span>');
		return true;
	}
	if (!($.isNumeric(checkMinLat))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Minimum latitude is not a valid numeric value.</span>');
		return true;
	}
	if (!($.isNumeric(checkMaxLat))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum latitude is not a valid numeric value.</span>');
		return true;
	}
	if (!($.isNumeric(checkMinLon))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Minimum longitude is not a valid numeric value.</span>');
		return true;
	}
	if (!($.isNumeric(checkMaxLon))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum longitude is not a valid numeric value.</span>');
		return true;
	}
	if (Math.abs(checkMinLat)>90){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Minimum latitude is out of bounds.</span>');
		return true;
	}
	if (checkMaxLat>90){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum latitude is out of bounds.</span>');
		return true;
	}
	if (Math.abs(checkMinLon)>180){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Minimum longitude is out of bounds.</span>');
		return true;
	}
	if (checkMaxLon>180){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum longitude is out of bounds.</span>');
		return true;
	}
	if ((parseFloat(checkMaxLat, 10)) <= (parseFloat(checkMinLat, 10))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum latitude must be larger than minimum latitude.</span>');
		return true;
	}
	if ((parseFloat(checkMaxLon, 10)) <= (parseFloat(checkMinLon, 10))){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Maximum longitude must be larger than minimum longitude.</span>');
		return true;
	}
	if ( (!($.isNumeric(checkMinMonth))) || (!($.isNumeric(checkMinDay))) || (!($.isNumeric(checkMinYear))) ||
		 (!($.isNumeric(checkMinHour))) || (!($.isNumeric(checkMinMinute))) || (!($.isNumeric(checkMinSecond))) ||
		 (!($.isNumeric(checkMaxMonth))) || (!($.isNumeric(checkMaxDay))) || (!($.isNumeric(checkMaxYear))) ||
		 (!($.isNumeric(checkMaxHour))) || (!($.isNumeric(checkMaxMinute))) || (!($.isNumeric(checkMaxSecond)))
		){
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Input for date-time field is not a valid numeric value.</span>');
		return true;
	}
	if (checkMinMonth>12) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">User input for date-time not a valid Month value.</span>');
		return true;
	}
	if (checkMinDay>31) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">User input for date-time not a valid Day value.</span>');
		return true;
	}
	if (checkMinHour>24) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">User input for date-time not a valid Hour value.</span>');
		return true;
	}
	if (checkMinMinute>59) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">User input for date-time not a valid Minute value.</span>');
		return true;
	}
	if (checkMinSecond>59) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">User input for date-time not a valid Second value.</span>');
		return true;
	}
	if (checkMinHour == 24) {
		$('#minMinute').val('00');
		$('#minSecond').val('00');
		minMinute = "00";
		minSecond = "00";
	}
	if (checkMaxHour == 24) {
		$('#maxMinute').val('00');
		$('#maxSecond').val('00');
		maxMinute = "00";
		maxSecond = "00";
	}
	
	var checkMaxTime = toTimestamp(checkMaxYear, checkMaxMonth, checkMaxDay, checkMaxHour, checkMaxMinute, checkMaxSecond);
	var checkMinTime = toTimestamp(checkMinYear, checkMinMonth, checkMinDay, checkMinHour, checkMinMinute, checkMinSecond);
	if (checkMaxTime < checkMinTime) {
		$('#subtitle').html('Error');
		$('#queryString').html('<span class="errorLog">Ending Date-Time must be greater than or equal to Starting Date-Time</span>');
		return true;
	}
	
	// format date-time to MM/DD/YYYY HH:MM:SS
	formatDatetime("minMonth", checkMinMonth);
	formatDatetime("minDay", checkMinDay);
	formatDatetimeYear("minYear", checkMinYear);
	formatDatetime("minHour", checkMinHour);
	formatDatetime("minMinute", checkMinMinute);
	formatDatetime("minSecond", checkMinSecond);
	formatDatetime("maxMonth", checkMaxMonth);
	formatDatetime("maxDay", checkMaxDay);
	formatDatetimeYear("maxYear", checkMaxYear);
	formatDatetime("maxHour", checkMaxHour);
	formatDatetime("maxMinute", checkMaxMinute);
	formatDatetime("maxSecond", checkMaxSecond);
	
	//Starting Date-Time
	// ensure user did not specify Apr, Jun, Sep, Nov date with more than 30 days
	if ((checkMaxMonth=="04")||(checkMaxMonth=="06")||(checkMaxMonth=="09")||(checkMaxMonth=="11")){
		if (checkMaxDay>30) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Starting Date-Time is not valid.</span>');
		return true;
		}
	// ensure user did not specify Feb date with more than 28 days
	} else if (checkMaxMonth=="02") {
		if (checkMaxMonth>28) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Starting Date-Time is not valid.</span>');
			return true;
		}
	}
	
	//Ending Date-Time
	// ensure user did not specify Apr, Jun, Sep, Nov date with more than 30 days
	if ((checkMaxMonth=="04")||(checkMaxMonth=="06")||(checkMaxMonth=="09")||(checkMaxMonth=="11")){
		if (checkMaxDay>30) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Ending Date-Time is not valid.</span>');
		return true;
		}
	// ensure user did not specify Feb date with more than 28 days
	} else if (checkMaxMonth=="02") {
		if (checkMaxDay>28) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Ending Date-Time is not valid.</span>');
			return true;
		}
	}
	
	// ensure user input a value in Limit textbox if checkbox is checked
	if ($('#searchguiLimitCheck').is(':checked')) {
		checkLimit = $('#searchguiLimitText').val();
		if (!checkLimit) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Limit value not entered.</span>');
			return true;
		} else if (!($.isNumeric(checkLimit))) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Limit must be a positive integer value.</span>');
			return true;
		} else if ((parseInt(checkLimit)) < 1) {
			$('#subtitle').html('Error');
			$('#queryString').html('<span class="errorLog">Limit must be a positive integer value.</span>');
			return true;
		}
	}
	
	return false;
}

// build query sentence if creating from form elements 
function buildQuery() {						
	var phpWithArg = "query_searchgui.php?";
	
	// icodemda.pvol_pdm_memory table selected
	if (tableType == 3) {
		if (searchTerm) {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM icodemda.pvol_pdm_memory VESSELS" +
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" AND (Name like ('" + searchTerm + 
					"') OR CommsID like ('" + searchTerm + 
					"') OR RxStnID like ('" + searchTerm + 
					"')) ORDER BY VESSELS.MMSI";
			} else {
				qStr = "SELECT * FROM icodemda.pvol_pdm_memory VESSELS" +
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" AND (Name like ('" + searchTerm + 
					"') OR CommsID like ('" + searchTerm + 
					"') OR RxStnID like ('" + searchTerm + 
					"')) ORDER BY VESSELS.MMSI" +
					" LIMIT " + limit;
			}				
		} else {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM icodemda.pvol_pdm_memory VESSELS" +
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" ORDER BY VESSELS.MMSI";
			} else {
				qStr = "SELECT * FROM icodemda.pvol_pdm_memory VESSELS" + 
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" ORDER BY VESSELS.MMSI" +
					" LIMIT " + limit;
			}
		}
		phpWithArg += "type=" + 3 + "&query=" + qStr;
		
	// icodemaps.radar_laisic_output_mem_track_heads table selected
	} else if (tableType == 2) {
		if (searchTerm) {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM laisic.radar_laisic_output_mem_track_heads VESSELS" +
					" WHERE lat BETWEEN " + minLat + " AND " + maxLat + 
					" AND lon BETWEEN " + minLon + " AND " + maxLon + 
					" AND datetime BETWEEN " + minTime + " AND " + maxTime + 
					" AND (mmsi ('" + searchTerm + 
					"') like radarName like ('" + searchTerm + 
					"') OR trknum like ('" + searchTerm + 
					"') OR vesselname like ('" + searchTerm + 
					"')) ORDER BY VESSELS.mmsi";
			} else {
				qStr = "SELECT * FROM laisic.radar_laisic_output_mem_track_heads VESSELS" +
					" WHERE lat BETWEEN " + minLat + " AND " + maxLat + 
					" AND lon BETWEEN " + minLon + " AND " + maxLon + 
					" AND datetime BETWEEN " + minTime + " AND " + maxTime + 
					" AND (mmsi ('" + searchTerm + 
					"') like radarName like ('" + searchTerm + 
					"') OR trknum like ('" + searchTerm + 
					"') OR vesselname like ('" + searchTerm + 
					"')) ORDER BY VESSELS.mmsi" +
					" LIMIT "  + limit;
			}				
		} else {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM laisic.radar_laisic_output_mem_track_heads VESSELS" +
					" WHERE lat BETWEEN " + minLat + " AND " + maxLat + 
					" AND lon BETWEEN " + minLon + " AND " + maxLon + 
					" AND datetime BETWEEN " + minTime + " AND " + maxTime + 
					" ORDER BY VESSELS.mmsi";
			} else {
				qStr = "SELECT * FROM laisic.radar_laisic_output_mem_track_heads VESSELS" + 
					" WHERE lat BETWEEN " + minLat + " AND " + maxLat + 
					" AND lon BETWEEN " + minLon + " AND " + maxLon + 
					" AND datetime BETWEEN " + minTime + " AND " + maxTime + 
					" ORDER BY VESSELS.mmsi" + 
					" LIMIT "  + limit;
			}
		}	
		phpWithArg += "type=" + 2 + "&query=" + qStr;
		
	// icodemda.vessels_memory table selected	
	} else if (tableType == 1) {
		if (searchTerm) {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM icodemda.vessels_memory VESSELS" + 
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" AND (MMSI like ('" + searchTerm + 
					"') OR IMONumber like ('" + searchTerm + 
					"') OR Name like ('" + searchTerm + 
					"') OR Destination like ('" + searchTerm + 
					"') OR CallSign like ('" + searchTerm + 
					"') OR RxStnID like ('" + searchTerm + 
					"')) ORDER BY VESSELS.MMSI";
			} else {
				qStr = "SELECT * FROM icodemda.vessels_memory VESSELS" +
					" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
					" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
					" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
					" AND (MMSI like ('" + searchTerm + 
					"') OR IMONumber like ('" + searchTerm + 
					"') OR Name like ('" + searchTerm + 
					"') OR Destination like ('" + searchTerm + 
					"') OR CallSign like ('" + searchTerm + 
					"') OR RxStnID like ('" + searchTerm + 
					"')) ORDER BY VESSELS.MMSI" + 
					" LIMIT " + limit;
			}
		} else {
			if (limit == 'unlimited') {
				qStr = "SELECT * FROM icodemda.vessels_memory VESSELS" + 
				" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
				" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
				" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
				" ORDER BY VESSELS.MMSI";
			} else {
				qStr = "SELECT * FROM icodemda.vessels_memory VESSELS" + 
				" WHERE Latitude BETWEEN " + minLat + " AND " + maxLat + 
				" AND Longitude BETWEEN " + minLon + " AND " + maxLon + 
				" AND TimeOfFix BETWEEN " + minTime + " AND " + maxTime + 
				" ORDER BY VESSELS.MMSI" + 
				" LIMIT " + limit;
			}	
		}
		phpWithArg += "type=" + 1 + "&query=" + qStr;
	}
	
	return phpWithArg;
}

// converts character # to single quotes
function poundToQuotes(str) {
	str = str.replace(/#/g, "'");
	
	return str;
}

// converts character single quotes to #
function quotesToPound(str){
	str = str.replace(/'/g, "#");
	
	return str;
}

// retrieve info from database 
function getDBinfo (phpWithArg) {	
	// replace all # characters with single quotation
	phpWithArg = poundToQuotes(phpWithArg);
	
	// get info from database	
	$.getJSON(
		phpWithArg, // server URL
		function () { 
		}
	).done(function (response) {
		console.log('Query Builder: ' + response.query);

		$("#subtitle").html('Search Results (' + response.resultcount + ')');		
		qStr = response.query;	
			
		// vessels retrieved; display list so user can select vessel	
		if (response.resultcount > 0) {
			var tempStr = quotesToPound(response.query);
			
			$('#queryString').html(
				'<div>' +
					response.query + 
					' <button onclick="saveSearch(' + tableType + ',' + "'" + tempStr + "'" + ');">Save</button>' +
				'</div><div>&nbsp;</div>'
			);
			$('#results').html('');
			
			if (tableType == 3) {
				for (var i=0;i<response.resultcount;i++) {
					var qbCommsId = response.vesseldata[i].qbCommsId;
					var qbRxStnId = response.vesseldata[i].qbRxStnId;
					var qbHeading = response.vesseldata[i].qbHeading;
					var qbSog = response.vesseldata[i].qbSog;
					var qbCog = response.vesseldata[i].qbCog;
					var tempStr = 'SELECT * FROM icodemda.pvol_pdm_memory VESSELS ' +
						' WHERE Latitude BETWEEN' + minLat + 'AND ' + maxLat + 
						' AND Longitude BETWEEN ' + minLon + ' AND ' + maxLon + 
						' AND TimeOfFix BETWEEN ' + minTime + ' AND ' + maxTime +
						' AND CommsID like #' + qbCommsId + '#' +
						' ORDER BY VESSELS.MMSI'
						
					$('#results').append(
						'<div class="resultsContainer">' +
							'<div class="resultsLeft">' +
								' <button onclick="selectSearch(' + tableType + ',' + "'" + tempStr + "'" + ');">Select</button>' +
							'</div>' +
							'<div class="resultsRight">' +
								(i+1) + 
								' | Comms ID: ' + qbCommsId + 
								' | RxStnID: ' + qbRxStnId + 
								' | Heading: ' + qbHeading + 
								' | SOG: ' + qbSog + 
								' | COG: ' + qbCog +
								'</div>' +
							'</div>'
					);					
				}
			} else if (tableType == 2) {
				for (var i=0;i<response.resultcount;i++) {
					var qbMmsi = response.vesseldata[i].qbMmsi;
					var qbImo = response.vesseldata[i].qbImo;
					var qbCallSign = response.vesseldata[i].qbCallSign;
					var qbName = response.vesseldata[i].qbName;
					var qbTrkNum = response.vesseldata[i].qbTrkNum;	
					var tempStr = 'SELECT * FROM laisic.radar_laisic_output_mem_track_heads VESSELS ' +
						' WHERE lat BETWEEN' + minLat + 'AND ' + maxLat + 
						' AND lon BETWEEN ' + minLon + ' AND ' + maxLon + 
						' AND datetime BETWEEN ' + minTime + ' AND ' + maxTime +
						' AND trknum like #' + qbTrkNum + '#' +
						' ORDER BY VESSELS.mmsi'
						
					$('#results').append(
						'<div class="resultsContainer">' +
							'<div class="resultsLeft">' +
								' <button onclick="selectSearch(' + tableType + ',' + "'" + tempStr + "'" + ');">Select</button>' +
							'</div>' +
							'<div class="resultsRight">' +
								(i+1) + 
								' | Name: ' + qbName + 
								' | IMO: ' + qbImo + 
								' | MMSI: ' + qbMmsi + 
								' | Call Sign: ' + qbCallSign + 
								' | Track No: ' + qbTrkNum +
							'</div>' +
						'</div>'
					);
				}
			} else if (tableType == 1) {
				for (var i=0;i<response.resultcount;i++) {
					var qbName = response.vesseldata[i].qbName;
					var qbImo = response.vesseldata[i].qbImo;
					var qbMmsi = response.vesseldata[i].qbMmsi;
					var qbCallSign = response.vesseldata[i].qbCallSign;
					var qbVesType = response.vesseldata[i].qbVesType;	
					var tempStr = 'SELECT * FROM icodemda.vessels_memory VESSELS ' +
						' WHERE Latitude BETWEEN ' + minLat + ' AND ' + maxLat + 
						' AND Longitude BETWEEN ' + minLon + ' AND ' + maxLon + 
						' AND TimeOfFix BETWEEN ' + minTime + ' AND ' + maxTime +
						' AND Name like #' + qbName + '#' +
						' AND IMONumber like #' + qbImo + '#' +
						' ORDER BY VESSELS.MMSI';						

					$('#results').append(
						'<div class="resultsContainer">' +
							'<div class="resultsLeft">' +
								' <button onclick="selectSearch(' + tableType + ',' + "'" + tempStr + "'" + ');">Select</button>' +
							'</div>' +
							'<div class="resultsRight">' +
								(i+1) +
								' | Name: ' + qbName + 
								' | IMO: ' + qbImo + 
								' | MMSI: ' + qbMmsi + 
								' | Call Sign: ' + qbCallSign + 
								' | Type: ' + qbVesType +
							'</div>' +
						'</div>'
					);
				}
			}
			
		// no vessels retrieved; display message
		} else {
			$("#subtitle").html('Search Results');
			$("#results").html('<div style="color:red;font-weight:bold;">No results found.</div>');
		}	
	}).fail(function() {
		console.log('Query Builder: No response from database; error in php?');
		return;
	});
}

// show query builder search parameters 
function showQuerySearch() {
	// display the search string in search results div in document
	$('#subtitle').html('Search Results');
	$('#queryString').html('');
	$('#queryString').append(
		'Search term ' + 
		searchConstraint + ' ' +
		searchTerm + ', ' +
		'Obtain vessels from ' + tableName + ' table, ' +
		'Latitude between ' + minLat + ' and ' + maxLat + ', ' +
		'Longitude between ' + minLon + ' and ' + maxLon + ', ' +
		'Date-time from ' + 
		minMonth + '/' + minDay + '/' + minYear + ' ' + minHour + ':' + minMinute + ':' + minSecond + ' to ' + 
		maxMonth + '/' + maxDay + '/' + maxYear + ' ' + maxHour + ':' + maxMinute + ':' + maxSecond + ', ' +
		'Limit to ' + limit + ' vessels. ' +
		' <button onclick="saveSearch(' + tableType + ',' + qStr + ')">Save</button>'
	);
}

//////////////////////////////
// SAVED SEARCHES FUNCTIONS //
//////////////////////////////

// save search query 
function saveSearch(type,str) {
	var name = "";
	var idx = searchSize;
	searchSize++;
	
	while(!name) {
		name = prompt("Please enter name for query.");
	}
	
	savedName[idx] = name;
	savedType[idx] = type;
	savedString[idx] = str;
	
	$('#searchHistory').append(
		'<p class="savedSearchLabel">' + savedName[idx] + '</p><p class="customBtn">' +
		'<button class="button1" onclick="triggerSavedSearch(' + idx + ');">Select</button> ' +
		'<button class="button1" onclick="triggerRenameSavedSearch(' + idx + ');">Rename</button> ' +
		'<button class="button1" onclick="triggerRemoveSavedSearch(' + idx + ');">Remove</button>' +
		'</p>'
	);
	
	// TO-DO: show saved search; will not stay down when already open; undefined
	if(!($('#historytab').prop('aria-selected'))){
		$('#historytab').click();
		console.log($('#historytab').prop('aria-selected'));
	}
}

// select search from Results List 
function selectSearch(type,str) {
	qStr = poundToQuotes(str);
	$('#queryString').html(
		'<div>' +
			qStr + 
			' <button onclick="saveSearch(' + type + ',' + "'" + str + "'" + ');">Save</button>' +
		'</div><div>&nbsp;</div>'
	);
	
	// send query to Maps Widget
	launchMaps();
	sendQueryToMap(qStr);
}

// retrieve saved searches 
function triggerSavedSearch(idx) {
	var type = savedType[idx];
	var str = savedString[idx];
	qStr = str.replace(/#/g, "'");
	
	// show new search string in document
	$('#subtitle').html('Search Results');
	$('#queryString').html(qStr);
	$('#results').html('Saved search ' + savedName[idx] + ' selected. Launching query in <i>Maps Widget</i>.');
	
	// send query to Maps Widget
	launchMaps();
	sendQueryToMap(qStr);
	
	// parse query sentence
//	parseQuery();
	
}

// rename saved searches 
 function triggerRenameSavedSearch(idx) {
	var name = "";
	
	// prompt user for new name
	while(!name) {
		name = prompt("Please enter name for saved query.");
	}
	// add new name to array
	savedName[idx] = name;
	
	//refresh saved searches displayed on document
	refreshSearchHistory();
 }
 
// remove saved searches 
 function triggerRemoveSavedSearch(idx) {
	// decrease size
	searchSize -= 1;
	
	// remove element and reshape array if needed
	if (idx != searchSize) {
		for(var i=idx;i<searchSize;i++){
			savedName[i] = savedName[i+1];
			savedType[i] = savedType[i+1];
			savedString[i] = savedString[i+1];
		}
	}
	
	// remove last element from array
	savedName[searchSize] = null;
	savedType[searchSize] = null;
	savedString[searchSize] = null;
	
	// refresh saved searches displayed on document
	refreshSearchHistory();
 }

// refresh saved searches 
 function refreshSearchHistory() {
	$('#searchHistory').html('');
	for(var i=0; i < searchSize; i++) {
		$('#searchHistory').append(
			'<p class="savedSearchLabel">' + savedName[i] + '</p><p class="customBtn">' +
			'<button class="button1" onclick="triggerSavedSearch(' + i + ');">Select</button> ' +
			'<button class="button1" onclick="triggerRenameSavedSearch(' + i + ');">Rename</button> ' +
			'<button class="button1" onclick="triggerRemoveSavedSearch(' + i + ');">Remove</button>' +
			'</p>'
		);
	}
 }

///////////////////////////
//	Launches maps widget //
///////////////////////////

// broadcast query to maps widget
function sendQueryToMap(str) {
	OWF.Eventing.publish("queryBuilderToMap", str);
}
function launchMaps() {
	OWF.Launcher.launch({
		universalName: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		guid: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
//		universalName: 'df54c300-e1d4-a7f5-dc5c-041ae84175dc',
//		guid: 'df54c300-e1d4-a7f5-dc5c-041ae84175dc',
		title: 'ICODE-MDA Maps',
		launchOnlyIfClosed: true
	}, callback);
}
function callback() {
	// placeholder for launchMaps function
}

var latMinMsg;
var lonMinMsg;
var latMaxMsg;
var lonMaxMsg;

function toggleButtons(){
	$('#launchMaps').hide();
	$('#addRectangle').show();
	$('#acceptCoordinates').show();
}
// draw rectangle on Maps widget
function addRectangle() {	
	// notice to user
	$('#rectUpdate').html('Specify region of interest by resizing or moving the rectangle.');
	
	// enable 'Accept' button
	$('#acceptCoordinates').prop('disabled', false);
	
	// Add channel listener
	OWF.Eventing.subscribe("mapToQueryBuilder", this.mapToQueryBuilder);
	OWF.Eventing.publish("qbToMap", 'Add: ');
}

var mapToQueryBuilder = function(sender,msg){
	var msgStr = msg.split(': ');
	
	if(msgStr[0] == 'Error'){
		// notice to user
		$('#rectUpdate').html('Rectangle already exists!');
	} else if(msgStr[0] == 'LatLon') {
		// parse string for Lat and Lon values
		var str = msgStr[1].split(',');
		latMinMsg = str[0];
		lonMinMsg = str[1];
		latMaxMsg = str[2];
		lonMaxMsg = str[3];
	} 
}
function acceptCoordinates(){
console.log('Accept: (' + latMinMsg + ',' + lonMinMsg + '),(' + latMaxMsg + ',' + lonMaxMsg+')');	

	// update input elements for Lat and Lon
	$('#minLat').val(latMinMsg);
	$('#minLon').val(lonMinMsg);
	$('#maxLat').val(latMaxMsg);
	$('#maxLon').val(lonMaxMsg);
	
	// notice to user
	$('#rectUpdate').html('Updated latitude and longitude.');
	$('#acceptCoordinates').prop('disabled', true);
	
	// tell maps to remove rectangle from map
	OWF.Eventing.publish("qbToMap", 'Accept: ');	
}

/* 
// issue: query launches before maps is done loading, thus query is seems to not be entered
// to-do: fix load order; load maps first THEN load new query
var launchMaps = function (){
	var r = $.Deferred();
	
	OWF.Launcher.launch({
		universalName: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
		guid: 'e23da61e-3a4f-3237-360b-af328ffc1d4e',
//		universalName: 'df54c300-e1d4-a7f5-dc5c-041ae84175dc',
//		guid: 'df54c300-e1d4-a7f5-dc5c-041ae84175dc',
		title: 'ICODE-MDA Maps',
		launchOnlyIfClosed: true
	}, callback);
	
	setTimeout(function() {
		r.resolve();
	}, 2500);
	
	return r;
};
function callback() {
}
var sendQueryToMap = function(str){
	OWF.Eventing.publish("queryBuilderToMap", str);
};
*/

//	Formats date-time user input elements to add to queryString string: Month, Day, Hour, Minute, Second
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
 
// Formats date-time user input elements to add to queryString string: Year
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

// converts date-time format to unix timestamp
function toTimestamp(year,month,day,hour,minute,second) {
	var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
	return Math.round(datum.getTime()/1000);
}

// toggle text box on when checkbox is checked for Limit Results
// toggle text box off when checkbox is unchecked for Limit Results
function enableLimitInput() {
	$('#searchguiLimit').toggle($('#searchguiLimitCheck').checked);
}

//////////////////////
// Tutorial Section //
//////////////////////
function triggerTutorial() {
	$('#subtitle').html('Tutorial');
	$('#queryString').html('');
	$('#results').html(
		'<div>This tutorial will guide you through the process of building a search query to retrieve and display vessels on the <i>Maps Widget</i>.</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 1: Tables</div>' +
		'<div>' +
			'Click on the Tables tab on the "Query Options" panel to the left.<br />' +
			'<img width="50%" src="img/tutorial_search_step1_2.jpg"><br /><br />' +
			'Select the database to use to retrieve vessels.<br />' +
			'<img width="50%" src="img/tutorial_search_step1_3.jpg"><br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 2: Geographic Coordinates</div>' +
		'<div>' +
			'Click on the Geographic Coordinates tab on the "Query Options" panel to the left.<br />' +
			'<img width="50%" src="img/tutorial_search_step2_1.jpg"><br /><br />' +
			'Specify the region of interest (ROI) by typing in the latitude and longitude or using the draw tool on the <i>Maps Widget</i> by pressing the "Launch" button.<br />' +
			'<img width="50%" src="img/tutorial_search_step2_2.jpg"><br />' +
			'By default the latitude and longitude is set to capture the entire world map (Lat from -90 to 90 degrees and Lon -180 to 180 degrees).<br /><br />' +
			'After clicking the "Launch" button the <i>Maps Widget</i> will launch and two new options will appear: "Add" and "Accept".<br /><br />' +
			'<img width="28%" src="img/tutorial_search_step2_3.jpg"><br />' +
			'To start the draw tool click "Add". A red rectangle will be visible on the maps. This rectangle is draggable and resizeable. After the rectangle is over the ROI click "Accept". This will update the latitude and longitude coordinates on the <i>Query Builder Widget</i>.<br />' +
			'<img width="80%" src="img/tutorial_search_step2_4.jpg"><br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 3: Date-Time</div>' +
		'<div>' +
			'Click on the Date-Time tab on the "Query Options" panel to the left.<br />' +
			'<img width="50%" src="img/tutorial_search_step3_1.jpg"><br /><br />' +
			'Specify the date and time frame for the vessels of interest. Date format is Month/Day/Year. Time format is Hour/Minute/Second.<br />' +
			'<img width="50%" src="img/tutorial_search_step3_2.jpg"><br />' +
			'By default the date-time frame is set to 30 mins prior to when the widget was first launched.<br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 4: Limit</div>' +
		'<div>' +
			'Click on the Limit tab on the "Query Options" panel to the left.<br />' +
			'<img width="50%" src="img/tutorial_search_step4_1.jpg"><br /><br />' +
			'Check the "Limit Results" checkbox to limit the number of vessels retrieved. If checked, enter the maximum number of vessels to retrieve.<br />' +
			'<img width="50%" src="img/tutorial_search_step4_2.jpg"><br />' +
			'By default no limit is set (i.e. checkbox is unchecked).<br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 5: Search</div>' +
		'<div>' +
			'Enter the search term(s) to retrieve in the search panel above. Then specify the constraint for the search term(s) by selecting an option in the dropdown menu.<br />' +
			'<img width="80%" src="img/tutorial_search_step5_1.jpg"><br />' +
			'1. Type search term in text box.<br />' +
			'2. Select constraint for search term from drop down menu<br />' +
			'3. Click on the search button to build a search query from inputs.<br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 6: Results</div>' +
		'<div>' +
			'The <i>Maps Widget</i> will launch and populate vessels matching the search query. In addition, the <i>Query Builder Widget</i> will display the built search query and all vessels matching the search query in "Search Results" panel.<br />' +
			'<img width="70%" src="img/tutorial_search_step6_2.jpg"><br />' +
			'<img width="80%" src="img/tutorial_search_step6_1.jpg"><br />' +
		'</div>' +
		'<div>&nbsp;</div>' +
		'<div class="blueTitle">Step 7: Saved Searches</div>' +
		'<div>' +
		'To save a search query click on the save button next to the query. A dialog box will pop up. Type a name for the entry.<br />' +
		'<img width="80%" src="img/tutorial_search_step7_1.jpg"><br /><br />' +
		'Your saved search query can be viewed in the Saved Searches tab. You can select, rename, or remove the saved query at any time from this tab.' +
		'<img width="50%" src="img/tutorial_search_step7_2.jpg"><br />' +
		'</div>' +
		'<div>&nbsp;</div>'
	);
}
