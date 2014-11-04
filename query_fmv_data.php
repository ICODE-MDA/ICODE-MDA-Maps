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
		'Database='.$fmv_database.';'.
		'uid='.$fmv_user .'; pwd='.$fmv_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}

//------------------------ Build the initial base query --------------------------

//Query statement - default statement unless user inputs custom statement
//TEST QUERY:
//SELECT a.target_index, x(a.location) as Latitude, y(a.location) as Longitude, b.datetime FROM fmv.fmv_target a left join fmv.fmv_sensor b on a.session_id = b.session_id and a.frame_number = b.frame_number;
//
//FOR DEMO QUERY:
//SELECT a.target_index, x(a.location) as Latitude, y(a.location) as Longitude, UNIX_TIMESTAMP(NOW()) as datetime FROM fmv.fmv_target a 
$query = "SELECT * FROM (SELECT TARGET.target_index, X(TARGET.location) AS Latitude, Y(TARGET.location) AS Longitude, UNIX_TIMESTAMP(NOW()) AS datetime FROM fmv.fmv_target TARGET) a WHERE ";

$meridianflag = false;

if (!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
   !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
      if ($_GET["minlon"] > $_GET["maxlon"]) {
         $meridianflag = true;
      }
      else {
         $meridianflag = false;
      }
      if ($meridianflag == false) { //Handle normal case
         $query = $query . " Latitude BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
            " AND Longitude BETWEEN " .  round($_GET["minlon"],3) . " AND " . round($_GET["maxlon"],3);
      }
      else {
         $query = $query . " Latitude BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
            " AND (Longitude BETWEEN -180 AND " . round($_GET["maxlon"],3) .
            " OR Longitude BETWEEN " . round($_GET["minlon"],3) . " AND 180 )";
      }
}

if (!empty($_GET["contact_age"])) {
   $contact_age = $_GET["contact_age"];
   $query = $query . " AND datetime > (UNIX_TIMESTAMP(NOW()) - 60*60*$contact_age)";
}

$query = $query . " LIMIT 1000";


//Execute the query
$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);
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

//echo json_encode(array(query => $query));
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Extract the vessel type number only
   $pos = strpos(odbc_result($result,"VesType"), '-');
   $vesseltype = substr(odbc_result($result,"VesType"), 0, $pos);

   //Fix the type 60-99 types, SeaVision format skipped the trailing '0'
   if ($vesseltype == '6' OR $vesseltype == '7' OR $vesseltype == '8' OR $vesseltype == '9')
      $vesseltype = $vesseltype . '0';

   //SeaVision field names
   $vessel = array(id=>odbc_result($result,"target_index"),
      lon=>odbc_result($result,"Longitude"),
      lat=>odbc_result($result,"Latitude"),
      datetime=>odbc_result($result,"datetime"),
   );

   array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vessels => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

