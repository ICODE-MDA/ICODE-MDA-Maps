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

//Get variables
$user = (string)$_GET["user"];

//Query statement
$query = "SELECT * FROM risk.user_ship_risk WHERE user_id LIKE '$user' LIMIT 100";

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
   
   $vessel = array(imo=>htmlspecialchars(odbc_result($result,"imo_number")),
		safScore=>htmlspecialchars(odbc_result($result,"safety_score")),
		secScore=>htmlspecialchars(odbc_result($result,"security_score")),
		safRating=>htmlspecialchars(odbc_result($result,"safety_rating")),
		secRating=>htmlspecialchars(odbc_result($result,"security_rating")),
		mmsi=>htmlspecialchars(odbc_result($result,"mmsi"))
	);
	
	array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vesseldata => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>