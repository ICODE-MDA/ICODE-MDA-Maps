var searchQuery = ""; 	// search query string

// OWF: broadcast query to maps
function sendQueryToMaps(str) {
	OWF.Eventing.publish("queryBuilder", str);
}

// trigger click event to search when 'Enter' key pressed
$(document).on("keypress", "searchguiQuery", function(e) {
	if (e.which == 13) {
		// print what you are searching for
		searchguiResults();
	}
});

function searchguiResults() {
	$('#queryString').html("");
	$('#results').html("");
	
	////////////////////////////////
	// check for user input error //
	////////////////////////////////
	
	// geographic coordinates
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
	
	
	////////////////////////////////////
	// build search query from string //
	////////////////////////////////////
	var substring = "";		// search query substring
	
	/*
	// add custom search terms to searchQuery string
	 */ 
	searchQuery = $('#searchguiQuery').val();
	if (searchQuery != "") {
		searchQuery = "Search Terms: +Custom Query Terms: " + searchQuery;
	} else {
		searchQuery = "Search Terms: +Custom Query Terms: none";
	}	
	
	/*
	// add geographic coordinates to searchQuery string
	 */
	var minLat = $('#minLat').val();
	var maxLat = $('#maxLat').val();
	var minLon = $('#minLon').val();
	var maxLon = $('#maxLon').val();
	substring = "+Latitude: " + minLat + "," + maxLat + "+Longitude: " + minLon + "," + maxLon;
	searchQuery = searchQuery + substring;
	
	/*
	// add order by type to searchQuery string
	 */
	var orderElId = ["#mmsi", "#sog", "#lon", "#lat", "#cog", "#dateTime", "#streamId", "#targetStatus", "#targetAcq", "#trackNo", "#sourceId"];
	var orderDesc = ["MMSI", "SOG", "Longitude", "Latitude", "COG", "Date Time", "Stream ID", "Target Status", "Target Acquired", "Track Number", "Source ID"];

	substring = "";
	for (var i=0; i<orderElId.length; i++) {
		if ($(orderElId[i]).prop('checked')) {
			if (substring != "") {
				substring = substring + "," + orderDesc[i];
			} else {
				substring = orderDesc[i];
			}
		}
	}

	substring = "+Order By: " + substring;
	searchQuery = searchQuery + substring;
	
	/*
	// display the search string in main panel
	 */
	$('#queryString').html(searchQuery);
	
	// parse string and build search query for MySQL database
	var queryStr = doQuerySearch(); 
}

function doQuerySearch() {
	// parse search query string
	var strSplit = searchQuery.split('+');
	var customQuerySplit = (strSplit[1].split(": "))[1].split(",");	// custom search terms	
	var latSplit = (strSplit[2].split(": "))[1].split(","); 		// latitude
	var lonSplit = (strSplit[3].split(": "))[1].split(",");			// longitude
	var orderSplit = (strSplit[4].split(": "))[1].split(","); 		// order by type
	
	var orderStr = "";
	for (var i=0; i<orderSplit.length; i++) {
		if (orderSplit[i] == "MMSI") {
			orderStr = orderStr + "MMSI";
		} else if (orderSplit[i] == "SOG") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "SOG";
		} else if (orderSplit[i] == "Longitude") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "Longitude";
		} else if (orderSplit[i] == "Latitude") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "Latitude";
		} else if (orderSplit[i] == "COG") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "COG";
		} else if (orderSplit[i] == "Date Time") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "datetime";
		} else if (orderSplit[i] == "Stream ID") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "streamid";
		} else if (orderSplit[i] == "Target Status") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "target_status";
		} else if (orderSplit[i] == "Target Acquired") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "target_acq";
		} else if (orderSplit[i] == "Track Number") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "";
		} else if (orderSplit[i] == "Source ID") {
			if (i>0) {
				orderStr = orderStr + ",";
			}
			orderStr = orderStr + "sourceid";
		}
	}
	
	// build MySQL sentence string
	var qStr = "SELECT * ";
	if (customQuerySplit != "none") {
		qStr = qStr + "FROM icodemda.vessels_memory VESSELS ";
		qStr = qStr + "WHERE Latitude BETWEEN " + latSplit[0] + " AND " + latSplit[1] +" ";
		qStr = qStr + "AND Longitude BETWEEN " + lonSplit[0] + " AND " + lonSplit[1] + " ";
		qStr = qStr + "AND (MMSI like ('%" + customQuerySplit +"%') ";
		qStr = qStr + "OR IMONumber like ('%" + customQuerySplit +"%') ";
		qStr = qStr + "OR Name like ('%" + customQuerySplit +"%') ";
		qStr = qStr + "OR Destination like ('%" + customQuerySplit +"%') ";
		qStr = qStr + "OR CallSign like ('%" + customQuerySplit +"%') ";
		qStr = qStr + "OR RxStnID like ('%" + customQuerySplit +"%')) ";
		qStr = qStr + "ORDER BY VESSELS.MMSI";
		
		//qStr = customQuerySplit;
	} else {
		qStr = qStr + "FROM icodemda.vessels_memory VESSELS ";
		qStr = qStr + "WHERE Latitude BETWEEN " + latSplit[0] + " AND " + latSplit[1] +" ";
		qStr = qStr + "AND Longitude BETWEEN " + lonSplit[0] + " AND " + lonSplit[1] + " ";
		qStr = qStr + "ORDER BY VESSELS.MMSI";
	}
	
	// send query to maps widget; maps will refresh
	sendQueryToMaps(qStr);
}

function  uncheckRest(str) {
	var numChecked = 0;
	if ($('#mmsi').prop('checked')) { numChecked++; };
	if ($('#sog').prop('checked')) { numChecked++; };
	if ($('#lon').prop('checked')) { numChecked++; };
	if ($('#lat').prop('checked')) { numChecked++; };
	if ($('#cog').prop('checked')) { numChecked++; };
	if ($('#dateTime').prop('checked')) { numChecked++; };
	if ($('#streamId').prop('checked')) { numChecked++; };
	if ($('#targetStatus').prop('checked')) { numChecked++; };
	if ($('#targetAcq').prop('checked')) { numChecked++; };
	if ($('#trackNo').prop('checked')) { numChecked++; };
	if ($('#sourceId').prop('checked')) { numChecked++; };
	
	if (numChecked<1) {
		$('#queryString').html('<span class="errorLog">Notice: Must have at least one value selected. Default is to sort by MMSI.</span>');
		$('#mmsi').prop('checked', true);
	}
}

