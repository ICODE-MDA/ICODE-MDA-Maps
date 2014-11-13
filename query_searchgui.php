<?php
//Start execution time tracker
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$starttime = $mtime; 

//-----------------------------------------------------------------------------
//Database execution
//Keep database connection information secure
require("phpsql_dbinfo.php");

/* ************************************************** */

/* Building DSN */
$dsn =  'DRIVER={'.$odbc_driver.'};'.
		'Server='.$odbc_host.';'.
		'Database='.$ais_database.';'.
		'uid='.$odbc_user.'; pwd='.$odbc_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}

// Get query parameters
$type = (string)$_GET["type"];
$query = (string)$_GET["query"];

//Execute the query
$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);;
//-----------------------------------------------------------------------------

//End execution time
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$endtime = $mtime; 
$totaltime = ($endtime - $starttime); 

// Prevent caching.
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 01 Jan 1996 00:00:00 GMT');

// The JSON standard MIME header.
header('Content-type: application/json');

// echo json_encode(array(query => $query));
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

	// Output JSON object per row
	if ($type === '3') {
		$vessel = array(qbCommsId=>htmlspecialchars(odbc_result($result,"CommsID")),
			qbRxStnId=>htmlspecialchars(odbc_result($result,"RxStnID")),
			qbHeading=>htmlspecialchars(odbc_result($result,"Heading")),
			qbSog=>htmlspecialchars(odbc_result($result,"SOG")),
			qbCog=>htmlspecialchars(odbc_result($result,"COG"))
		);
	} else if ($type === '2') {
		$vessel = array(qbMmsi=>htmlspecialchars(odbc_result($result,"mmsi")),
			qbImo=>htmlspecialchars(odbc_result($result,"imo")),
			qbCallSign=>htmlspecialchars(odbc_result($result,"callsign")),
			qbName=>htmlspecialchars(odbc_result($result,"vesselname")),		
			qbTrkNum=>htmlspecialchars(odbc_result($result,"trknum"))
		);
	} else if ($type === '1') {
		$vessel = array(qbName=>htmlspecialchars(odbc_result($result,"Name")),
			qbImo=>htmlspecialchars(odbc_result($result,"IMONumber")),
			qbMmsi=>htmlspecialchars(odbc_result($result,"MMSI")),
			qbCallSign=>htmlspecialchars(odbc_result($result,"CallSign")),
			qbVesType=>htmlspecialchars(odbc_result($result,"vesType"))
		);
	} else {
		$vessel = array();
	}

	array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vesseldata => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
