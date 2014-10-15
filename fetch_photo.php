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
		'Database=ihs_photos;'.
		'uid='.$odbc_user.'; pwd='.$odbc_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
   exit("Connection Failed: " . $conn);
}


//Query statement - default statement unless user inputs custom statement
if (!empty($_GET["imo"])) {
   $imo = $_GET["imo"];
}

$query = "SELECT * FROM ihs_photos.shipscapeindex WHERE LRNO=$imo ORDER BY DateofPhoto DESC";

$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);

// Iterate through the output rows
$count_results = 0;
$photolist = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   $photorow = array(picid=>odbc_result($result,"PicID"),
                   imo=>odbc_result($result,"LRNO"),
                   copyright=>odbc_result($result,"Copyright"),
                   datestamp=>odbc_result($result,"DateofPhoto")
                );

   array_push($photolist, $photorow);
}

//var_dump($photolist[0]);


$picid = $photolist[0][picid];


//---------------------------------------------------------------------------------
//Set up the JPEG file reading from network drive
$base_dir = "//synology.sd.spawar.navy.mil/icode-mda/data/IHS_Data/WROS_1/WROS_Drive/Photostore/";

//$testfile = "279/27900_2.jpg";
$imagefile = substr($picid, 0, -2) . "/" . $picid . "_2.jpg";

$filetype = 'image/jpeg';

$fullfilepath = $base_dir . $imagefile;

//Read the file and output if exists
if(file_exists($fullfilepath) == TRUE) {
   header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
   header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
   header('Pragma: no-cache');
   header("Content-type: image/jpeg");

   readfile($fullfilepath);
   exit(0);
} 
else {
   //echo "Error fetching $fullfilepath\r\n";

   header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
   header('Cache-Control: no-cache, no-store, max-age=0, must-revalidate');
   header('Pragma: no-cache');
   header("Content-type: image/png");

   readfile("icons/noimage.png");

   exit(0);
}

?>

