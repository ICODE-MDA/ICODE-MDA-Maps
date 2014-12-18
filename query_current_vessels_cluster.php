<?php
//Start execution time tracker
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$starttime = $mtime; 

/* Types not included in legend
1-Reserved
2-WIG
20-WIG
21-Pusher
22-Push+Brg
23-LightBt
24-MODU
25-OSV
26-Process
27-Training
28-Gov
29-Auto
34-Diving
36-Sailing
38-Reserved
39-Reserved
4-HSC
53-Tender
54-AntiPol
56-Spare
57-Spare
58-Medical
59-Resol-18
9-Other
 */
$typesNotIncluded = [null, 1, 2, 34, 36, 38, 39, 4, 53, 54, 56, 57, 58, 59, 9];

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


//Query statement - default statement unless user inputs custom statement


$iGridRows = 16;
$iGridCols = 32;
//mobile
if (!empty($_GET["mobile"])) {
   $mobile = $_GET["mobile"];
   if ($mobile) {
      $iGridRows = 8;
      $iGridCols = 8;
   }
}

//Flag to keep track of whether a filter/criteria string has been started
$criteriaListStarted = 0;

$iMinClusterSize = 10;


//Setup vessel table to use based on Time Machine functionality state
$table = $vessels_table;
if (!empty($_GET["endtime"])) {
   $table = $vessels_history_table;
}


$latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$table WHERE (RxStnID = 'Local' OR RxStnID <> 'Local')";
if (!empty($_GET["mssisonly"])) {
   $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$table WHERE (RxStnID not like ('%ORBCOMM%') AND RxStnID not like ('%EXACT%'))";
   $criteriaListStarted = 1;
}
else if (!empty($_GET["sataisonly"])) {
   $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$table WHERE (RxStnID like ('%ORBCOMM%') OR RxStnID like ('%EXACT%'))";
   $criteriaListStarted = 1;
}

//Add vessel type filters here
if (!empty($_GET["vthide"])) {
   $vthideArray = $_GET["vthide"];

   for ($i=0; $i < sizeof($vthideArray) ; $i++) {
      $type = $vthideArray[$i];

      if ($type === "-1") {
         for ($j=0; $j < sizeof($typesNotIncluded); $j++) {
            if ($criteriaListStarted) {
               $latestpositionsfrommemorytableStr = $latestpositionsfrommemorytableStr . ' AND ';
            }
            else {
         $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$table WHERE (RxStnID = 'Local' OR RxStnID <> 'Local') AND ";

               $criteriaListStarted = 1;
            }
            $type = $typesNotIncluded[$j];
            if ($type === null) {
               $latestpositionsfrommemorytableStr = $latestpositionsfrommemorytableStr . "VesType not like ('')";
            }
            else {
               $latestpositionsfrommemorytableStr = $latestpositionsfrommemorytableStr . "VesType not like ('$type%')";
            }
         }
      }
      else {
         if ($criteriaListStarted) {
            $latestpositionsfrommemorytableStr = $latestpositionsfrommemorytableStr . ' AND ';
         }
         else {
         $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$table WHERE (RxStnID = 'Local' OR RxStnID <> 'Local') AND ";

            $criteriaListStarted = 1;
         }                        
         $latestpositionsfrommemorytableStr = $latestpositionsfrommemorytableStr . "VesType not like ('$type%')";
      }
   }
}

//Add timestamp constraint
if (!empty($_GET["vessel_age"])) {
   $vessel_age = $_GET["vessel_age"];
   //Handle Time Machine case
   if (!empty($_GET["endtime"])) {
      $endtime = $_GET["endtime"];
      $vesselageclause = "AND TimeOfFix BETWEEN ($endtime - 60*60*$vessel_age) AND $endtime";
   }
   //non-Time Machine
   else {
      $vesselageclause = "AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
   }
   $latestpositionsfrommemorytableStr .= $vesselageclause;
}

//Count the number of arguments
if(count($_GET) > 0) {
   $minlat = $_GET["minlat"];
   $maxlat = $_GET["maxlat"];
   $minlon = $_GET["minlon"];
   $maxlon = $_GET["maxlon"];

   /*
   //Check if flipped, then probably crossed the meridian (> +180, or < -180)
   if ($minlon > $maxlon) {
      $meridianflag = true;
   }
   else {
      $meridianflag = false;
   }
   */

   if (!empty($minlat) && !empty($minlon) &&
       !empty($maxlat) && !empty($maxlon)) {
      //$divlat = round( ($maxlat - $minlat) / 16, 3 );
      //$divlon = round( ($maxlon - $minlon) / 16, 3 );

      //TEST VOLPE's method
      /*
         //max lat/lon
         //difference 
         //find a common number that matches cluster, 8x8, 0 1 2 3 4 etc 7, 3 degrees every grid
         //div, round down
         //x1000 big number, 1001;  turn map to whole numbers
         //thousands = longitudes, 1's = latitude
       */
      $dlat = $maxlat-$minlat;
      $dlon = $maxlon-$minlon;

      if ($minlon > $maxlon) {
         $dlon = $maxlon+360-$minlon;
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND ((Longitude > $minlon AND Longitude <= 180.0) OR (Longitude < $maxlon AND Longitude >= -180.0))";
      }
      else {
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND Longitude > $minlon AND Longitude < $maxlon";
      }

      //Build main cluster query
      $query = "
SELECT
   $dlat * (FLOOR($iGridRows * (Latitude - $minlat) / $dlat) + 0.5) / $iGridRows + $minlat - $dlat/$iGridRows/2 AS bottomLat,
   $dlat * (FLOOR($iGridRows * (Latitude - $minlat) / $dlat) + 0.5) / $iGridRows + $minlat + $dlat/$iGridRows/2 AS topLat,
   $dlon * (FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon) + 0.5) / $iGridCols + $minlon - $dlon/$iGridCols/2 AS leftLon,
   $dlon * (FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon) + 0.5) / $iGridCols + $minlon + $dlon/$iGridCols/2 AS rightLon,
   count(*) AS clustersum
FROM
   (SELECT * FROM
      ($latestpositionsfrommemorytableStr) AS tmp1
   GROUP BY mmsi) AS tmp2
WHERE ($geobounds) 
GROUP BY FLOOR($iGridRows * (Latitude - $minlat) / $dlat) * 1000000 + FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon);";
//HAVING clustersum >= $iMinClusterSize;";
//

      //Remove special characters
      $query = trim(preg_replace('/\s+/', ' ', $query));
   }
}
else {
   
}


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
$clusterarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   /*
   $cluster = array(lat=>odbc_result($result,"Lat"),
                   lon=>odbc_result($result,"Lon"),
                   clustersum=>odbc_result($result,"clustersum"),
    */

   $cluster = array(leftLon=>odbc_result($result,"leftLon"),
                   rightLon=>odbc_result($result,"rightLon"),
                   bottomLat=>odbc_result($result,"bottomLat"),
                   topLat=>odbc_result($result,"topLat"),
                   clustersum=>odbc_result($result,"clustersum"),
   );

   array_push($clusterarray, $cluster);
}

$memused = memory_get_usage(false);

$data = array(minlat => $minlat, maxlat => $maxlat, minlon => $minlon, maxlon => $maxlon, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, cluster => $clusterarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

