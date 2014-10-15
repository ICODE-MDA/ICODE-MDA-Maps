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


function parseCriteria($field, $operation, $value) {
   $condstr = ""; //conditional string

   switch (strtolower($field)) {
   case "mmsi":
      $condstr .= "mmsi.toString()";
      break;
   case "imo":
      $condstr .= "imo.toString()";
      break;
   case "vesselname":
      $condstr .= "shipname.toString().toLowerCase()";
      break;
   case "callsign":
      $condstr .= "callsign.toString().toLowerCase()";
      break;
   case "destination":
      $condstr .= "destination.toString().toLowerCase()";
      break;
   case "vesseltype":
      $condstr .= "shiptype.toString().toLowerCase()";
      break;
   case "length":
      $condstr .= "length.toString()";
      break;
   case "width":
      $condstr .= "width.toString()";
      break;
   case "draught":
      $condstr .= "draught.toString()";
      break;
   default:
      exit('Error in parsing field');
   }

   //Condition string should be JS evaluatable statements using eval() function
   switch (strtolower($operation)) {
   case "equals":
      $condstr .= " == '$value'.toLowerCase()";
      break;
   case "contains":
      $condstr .= ".indexOf('$value'.toLowerCase()) != -1";
      break;
   case "starts with":
      $condstr .= ".startsWith('$value'.toLowerCase())";
      break;
   case "ends with":
      $condstr .= ".endsWith('$value'.toLowerCase())";
      break;
   case "=":
      $condstr .= " == $value";
      break;
   case "!":
      $condstr .= " != $value";
      break;
   case ">":
      $condstr .= " > $value";
      break;
   case "<":
      $condstr .= " < $value";
      break;
   case "is":
      $condstr .= " == $value";
      break;
   case "is not":
      $condstr .= " != $value";
      break;
   default:
   }

   return $condstr;//(string) "Test conditional";
}

//Example PHP call with some empty arguments:
//query_alert_setup.php?userid=icodeuser&alertPolygon=POLYGON((-18.45703125%20-42.68243539838621,4.04296875%20-27.527758206861897,16.171875%20-55.379110448010486,-18.45703125%20-42.68243539838621))&entering=true&exiting=true&interval=15&email="icodemda@gmail.com"&field=MMSI&operation=equals&value=&field=MMSI&operation=equals&value=&field=MMSI&operation=equals&value=&field=MMSI&operation=equals&value=

$conditional_statements = array();

if(count($_GET) > 0) {
   //Parse parameters for alert_properties
   if (!empty($_GET["userid"])) { 
      $userid = (string)$_GET["userid"];
   }
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

   //Parse parameters for criteria (expected to be empty if applying alert on ALL VESSELS)
   if (!empty($_GET["field"]) && !empty($_GET["operation"]) && !empty($_GET["value"])) {
      $fields = $_GET["field"];
      $operations = $_GET["operation"];
      $values= $_GET["value"];

      $num_criterion = sizeof($fields);

      for ($i=0; $i < $num_criterion; $i++) {
         //Build conditional statements
         array_push($conditional_statements, parseCriteria($fields[$i], $operations[$i], $values[$i]));
      }

      //exit('length ' . sizeof($conditional_statements) . ' and ' . $num_criterion);
      /*
      foreach($conditional_statements as $result) {
         echo $result, '<br>';
      }
       */
   }
}
else {
   exit('Need parameters');
}

//-----------------------------------------------------------------------------
//Build the query for `alert_properties`
$query_insert_alert = "INSERT INTO $alert_database.alert_properties (user_id, alert_interval, polygon, entering, exiting) VALUES ('$userid', $interval, PolygonFromText('$polygon'), $entering, $exiting)";

//Reset the auto-increment column for alert ID; uses max(1, current maximum value in column)
$query_resetcounter = 'ALTER TABLE alerts.alert_properties AUTO_INCREMENT = 1;';
$result = @odbc_exec($connection, $query_resetcounter) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_resetcounter);

//Execute the query for `alert_properties`
$result = @odbc_exec($connection, $query_insert_alert) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_insert_alert);

//-----------------------------------------------------------------------------
//Execute a query to obtain last inserted ID: 'SELECT LAST_INSERT_ID();'
$query_getid = 'SELECT LAST_INSERT_ID()';
$result = @odbc_exec($connection, $query_getid) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_getid);

if (odbc_fetch_row($result)) {
   $alert_id = odbc_result($result,"LAST_INSERT_ID()");
}

//-----------------------------------------------------------------------------
//Build the query for `criteria`
if (!empty($_GET["field"]) && !empty($_GET["operation"]) && !empty($_GET["value"])) {
   $query_add_criteria = "INSERT INTO $alert_database.criteria (alert_id, criteria_index, conditional_statement, boolean_operator) VALUES ";

   for ($i=0; $i < sizeof($conditional_statements); $i++) {
      //TODO: add criteria to multi-row insert statement
      if ($i > 0) {
         $query_add_criteria .= ",";
      }
      $query_add_criteria .= "(";
      $query_add_criteria .= $alert_id . ",";
      $query_add_criteria .= ($i+1) . ",";
      $query_add_criteria .= "\"$conditional_statements[$i]\",";
      //TODO: remove hard-coded AND value after adding boolean parsing to client
      $query_add_criteria .= "'AND'";    
      $query_add_criteria .= ")";
   }

   $query_add_criteria .= ";";

   //Execute the query for `criteria`
   $result = @odbc_exec($connection, $query_add_criteria) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query_add_criteria);
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

