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


//DEBUG
$userid = "testuser";

if(count($_GET) > 0) { 
   if (!empty($_GET["alertPolygon"])) { 
      $polygon = (string)$_GET["alertPolygon"];
   }
   if (!empty($_GET["email"])) { 
      $email = (string)$_GET["email"];
   }
   if (!empty($_GET["entering"])) { 
      $entering = (string)$_GET["entering"];
   }
   if (!empty($_GET["exiting"])) { 
      $exiting = (string)$_GET["exiting"];
   }
   if (!empty($_GET["interval"])) { 
      $interval = (string)$_GET["interval"];
   }
}

//Build the query
$query = "INSERT INTO $alert_database.alert_properties (user_id, alert_interval, polygon, entering, exiting) VALUES ('$userid', $interval, PolygonFromText('$polygon'), $entering, $exiting)";

//Reset the auto-increment column for alert ID; uses max(1, current maximum value in column)
$query_resetcounter = 'ALTER TABLE alerts.alert_properties AUTO_INCREMENT = 1;';
$result = @odbc_exec($connection, $query_resetcounter) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_resetcounter);

//Execute the query
$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);

//-----------------------------------------------------------------------------

//Execute a query again to obtain last inserted ID: 'SELECT LAST_INSERT_ID();'
$query_getid = 'SELECT LAST_INSERT_ID()';
$result = @odbc_exec($connection, $query_getid) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_getid);

if (odbc_fetch_row($result)) {
   $alert_id = odbc_result($result,"LAST_INSERT_ID()");
}

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

$memused = memory_get_usage(false);

//Returned data (includes queries used for debugging/development -> UNSAFE!)
//$data = array(query => $query, query_resetcounter=> $query_resetcounter, query_getid => $query_getid, exectime => $totaltime, memused => $memused, alert_id => $alert_id);

//Returned data, SAFE  
$data = array(exectime => $totaltime, memused => $memused, alert_id => $alert_id);

echo json_encode($data, JSON_PRETTY_PRINT);
?>

