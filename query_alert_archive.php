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
		'Database='.$alert_database.';'.
		//'uid='.$odbc_user.'; pwd='.$odbc_password;
		'uid=icodeuser; pwd=icodeuser';     //enable write access to add new alerts

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}

$countOnly = false;

if (count($_GET) > 0) { 
   if (!empty($_GET["alertid"])) { 
      $id = (string)$_GET["alertid"];
   }

   if (!empty($_GET["countOnly"])) { 
      if ($_GET["countOnly"] == 1) {
         $countOnly = true;
      }
   }
}

//-----------------------------------------------------------------------------
//Delete alert_properties that mach alert_id
//Build the query
if (isset($id)) {
   $fields = '*';    //grab all fields
   if ($countOnly) { //grab only count of rows
      $fields = 'count(*) as count';
   }

   $query = "SELECT $fields FROM $alert_database.archive WHERE alert_id=$id AND dismissed=0 AND vessel is not null";
}
else {
   echo json_encode(array(response => 'failure'), JSON_PRETTY_PRINT);
   exit();
}

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

if ($countOnly) {
   odbc_fetch_row($result);
   $count = odbc_result($result,"count");

   $memused = memory_get_usage(false);

   $data = array(query => $query, exectime => $totaltime, memused => $memused, alert_id => $id, count => $count);
}
else {
   $count_results = 0;
   $alertarray = array();
   while (odbc_fetch_row($result)){
      $count_results = $count_results + 1;

      $alert = array(timestamp=>odbc_result($result,"timestamp"),
         aisdata=>odbc_result($result,"aisdata"),
         vesseldata=>odbc_result($result,"vessel"),
         dismissed=>(intval(odbc_result($result,"dismissed")) == 0) ? false : true
      );

      array_push($alertarray, $alert);
   }

   $memused = memory_get_usage(false);

   //Returned data (includes queries used for debugging/development -> UNSAFE!)
   $data = array(query => $query, exectime => $totaltime, memused => $memused, alert_id => $id, alert_array => $alertarray);
}

echo json_encode($data, JSON_PRETTY_PRINT);
?>

