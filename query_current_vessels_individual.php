<?php
//Start execution time tracker
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$starttime = $mtime; 


//Example:
/*
SELECT 
    *
FROM
    vessels_memory c,
    (SELECT 
        *
    FROM
        (SELECT 
        *
    FROM
        (SELECT * FROM (SELECT * FROM vessels_memory WHERE TimeOfFix > (UNIX_TIMESTAMP(NOW()) - (3600 * 24)) ORDER BY TimeOfFix DESC) AS tmp1 GROUP BY mmsi) AS tmp2
    WHERE
        (latitude > - 103.858433
            AND latitude < 103.936369
            AND ((longitude > 20.000000
            AND longitude <= 180.0)
            OR (longitude < - 20.000000
            AND longitude >= - 180.0)))
            AND ROW( 207.794801 * (FLOOR(16 * (latitude - - 103.858433) / 207.794801) + .5) / 16 , 320.000000 * (FLOOR(32 * (IF(longitude > 20.000000, longitude, longitude + 360.0) - 20.000000) / 320.000000) + .5) / 32) IN (SELECT 
                tmp5.Lat AS Lat, tmp5.Lon AS Lon
            FROM
                (SELECT 207.794801 * (FLOOR(16 * (latitude - - 103.858433) / 207.794801) + .5) / 16 AS Lat,
                    320.000000 * (FLOOR(32 * (IF(longitude > 20.000000, longitude, longitude + 360.0) - 20.000000) / 320.000000) + .5) / 32 AS Lon,
                    count(*) AS Cnt
            FROM
                (SELECT * FROM (SELECT * FROM vessels_memory WHERE TimeOfFix > (UNIX_TIMESTAMP(NOW()) - (3600 * 24)) ORDER BY TimeOfFix DESC) AS tmp3 GROUP BY mmsi) AS tmp4
            WHERE
                (latitude > - 103.858433
                    AND latitude < 103.936369
                    AND ((longitude > 20.000000
                    AND longitude <= 180.0)
                    OR (longitude < - 20.000000
                    AND longitude >= - 180.0)))
            GROUP BY FLOOR(16 * (latitude - - 103.858433) / 207.794801) * 1000000 + FLOOR(32 * (IF(longitude > 20.000000, longitude, longitude + 360.0) - 20.000000) / 320.000000)) AS tmp5
            WHERE
                tmp5.Cnt < 10)) AS tmp6) AS p
WHERE
    c.mmsi = p.MMSI
    ORDER BY c.name;
*/

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


if(count($_GET) > 0) { 
   if (!empty($_GET["vessel_age"])) {
      $vessel_age = $_GET["vessel_age"];
   }

   if (!empty($_GET["minlat"]) && !empty($_GET["minlon"]) && !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
      //Check if flipped, then probably crossed the meridian (> +180, or < -180)
      if ($_GET["minlon"] > $_GET["maxlon"]) {
         $meridianflag = true;
      }
      else {
         $meridianflag = false;
      }

      $minlat = $_GET["minlat"];
      $maxlat = $_GET["maxlat"];
      $minlon = $_GET["minlon"];
      $maxlon = $_GET["maxlon"];

      $dlat = $maxlat-$minlat;
      $dlon = $maxlon-$minlon;

      if ($minlon > $maxlon) {
         $dlon = $maxlon+360-$minlon;
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND ((Longitude > $minlon AND Longitude <= 180.0) OR (Longitude < $maxlon AND Longitude >= -180.0))";
      }
      else {
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND Longitude > $minlon AND Longitude < $maxlon";
      }
   }

   $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$vessels_table WHERE TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
   if (!empty($_GET["mssisonly"])) {
      $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$vessels_table WHERE (RxStnID not like ('%ORBCOMM%') AND RxStnID not like ('%EXACT%')) AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age ORDER BY TimeOfFix DESC";
      $criteriaListStarted = 1;
   }
   else if (!empty($_GET["sataisonly"])) {
      $latestpositionsfrommemorytableStr = "SELECT * FROM $ais_database.$vessels_table WHERE (RxStnID like ('%ORBCOMM%') OR RxStnID like ('%EXACT%')) AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age ORDER BY TimeOfFix DESC";
      $criteriaListStarted = 1;
   }


   $query = "
     SELECT c.* FROM ($latestpositionsfrommemorytableStr) c, (
       SELECT * FROM (
         SELECT * FROM (
            SELECT * FROM ($latestpositionsfrommemorytableStr) AS tmp1 GROUP BY mmsi
         ) AS tmp2
         WHERE
         ($geobounds)
         AND ROW( 
               $dlat * (FLOOR($iGridRows * (latitude - $minlat) / $dlat) + .5) / $iGridRows , 
               $dlon * (FLOOR($iGridCols * (IF(longitude > $minlon, longitude, longitude + 360.0) - $minlon) / $dlon) + .5) / $iGridCols
         ) IN (
           SELECT tmp5.Lat AS Lat, tmp5.Lon AS Lon FROM (
             SELECT 
               $dlat * (FLOOR($iGridRows * (latitude - $minlat) / $dlat) + .5) / $iGridRows AS Lat,
               $dlon * (FLOOR($iGridCols * (IF(longitude > $minlon, longitude, longitude + 360.0) - $minlon) / $dlon) + .5) / $iGridCols AS Lon,
               count(*) AS clustersum
             FROM (
               SELECT * FROM ($latestpositionsfrommemorytableStr) AS tmp3 GROUP BY mmsi
             ) AS tmp4
             WHERE
             ($geobounds)
             GROUP BY FLOOR($iGridRows * (latitude - $minlat) / $dlat) * 1000000 + FLOOR($iGridCols * (IF(longitude > $minlon, longitude, longitude + 360.0) - $minlon) / $dlon)) AS tmp5
           WHERE
           tmp5.clustersum < $iMinClusterSize
         )
       ) AS tmp6
     ) AS p
     WHERE
     c.mmsi = p.MMSI
     ORDER BY c.name;";
}


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
       $vessel = array(mmsi=>odbc_result($result,"MMSI"),
             navstatus=>odbc_result($result,"NavStatus"),
             rot=>odbc_result($result,"ROT"),
             sog=>odbc_result($result,"SOG"),
             lon=>odbc_result($result,"Longitude"),
             lat=>odbc_result($result,"Latitude"),
             cog=>odbc_result($result,"COG"),
             heading=>odbc_result($result,"Heading"),
             datetime=>odbc_result($result,"TimeOfFix"),
             imo=>odbc_result($result,"IMONumber"),
             vesselname=>htmlspecialchars(odbc_result($result,"Name")),
             vesseltypeint=>$vesseltype,
             length=>odbc_result($result,"Length"),
             shipwidth=>odbc_result($result,"Beam"),
             bow=>odbc_result($result,"AntOffsetBow"),
             port=>odbc_result($result,"AntOffsetPort"),
             draught=>odbc_result($result,"Draft"),
             destination=>htmlspecialchars(odbc_result($result,"Destination")),
             callsign=>htmlspecialchars(odbc_result($result,"CallSign")),
             posaccuracy=>odbc_result($result,"PosQuality"),
             eta=>odbc_result($result,"ETADest"),
             posfixtype=>odbc_result($result,"PosSource"),
             streamid=>htmlspecialchars(odbc_result($result,"RxStnID")),
             security_rating=>odbc_result($result,"security_rating"),
             safety_rating=>odbc_result($result,"safety_rating"),
             risk_score_security=>odbc_result($result,"security_score"),
             risk_score_safety=>odbc_result($result,"safety_score")
          );

    array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vessels => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

