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
		//'uid='.$odbc_user.'; pwd='.$odbc_password;
		'uid=icodeuser; pwd=icodeuser';     //enable write access to add new alerts

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}

// get variables
$secBound1 = intval($_GET["secBound1"]);
$secBound2 = intval($_GET["secBound2"]);
$secCompany = intval($_GET["secCompany"]);
$secBlackFlag = intval($_GET["secBlackFlag"]);
$secGrayFlag = intval($_GET["secGrayFlag"]);
$secNoInsp = intval($_GET["secNoInsp"]);
$secInspHist = intval($_GET["secInspHist"]);
$secDetention = intval($_GET["secDetention"]);
$secMinorControl = intval($_GET["secMinorControl"]);
$secNationality = intval($_GET["secNationality"]);
$secInsPort = intval($_GET["secInsPort"]);
$secPortNotISPS = intval($_GET["secPortNotISPS"]);
$secNoPortHist = intval($_GET["secNoPortHist"]);
$secCrew = intval($_GET["secCrew"]);
$secDowngrade = intval($_GET["secDowngrade"]);
$safBound1 = intval($_GET["safBound1"]);
$safBound2 = intval($_GET["safBound2"]);
$safCompany = intval($_GET["safCompany"]);
$safBlackFlag = intval($_GET["safBlackFlag"]);
$safGrayFlag = intval($_GET["safGrayFlag"]);
$safHighClass = intval($_GET["safHighClass"]);
$safMedClass = intval($_GET["safMedClass"]);
$safLowClass = intval($_GET["safLowClass"]);
$safNoInsp = intval($_GET["safNoInsp"]);
$safDetention = intval($_GET["safDetention"]);
$safControl = intval($_GET["safControl"]);
$safCasualty = intval($_GET["safCasualty"]);
$safViolation = intval($_GET["safViolation"]);
$safTankerPass = intval($_GET["safTankerPass"]);
$safLt10 = intval($_GET["safLt10"]);
$saf10to20 = intval($_GET["saf10to20"]);
$safGt20 = intval($_GET["safGt20"]);
$safMultiAdmin = intval($_GET["safMultiAdmin"]);
$mouList = (string)$_GET["mouList"];

//Insert RISK score settings
if (isset($secCompany)) {
	$query = "UPDATE test_julie.usersettings SET
	ISPS1ISPS2Boundary=$secBound1,
	ISPS2ISPS3Boundary=$secBound2,
	ptscompanysecurity=$secCompany,
	ptsblackflagsecurity=$secBlackFlag,
	ptsgrayflagsecurity=$secGrayFlag,
	ptsnoispsinspect=$secNoInsp,
	ptsispsinspectionhistory=$secInspHist,
	ptsperispsdetention=$secDetention,
	ptsispsminorcontrol=$secMinorControl,
	ptsNationalitiesRisk=$secNationality,
	ptsinsecureport=$secInsPort,
	ptsPortNotISPS=$secPortNotISPS,
	ptsNoPortHistory=$secNoPortHist,
	ptsNoCrewData=$secCrew,
	allowIPSPDowngrade=$secDowngrade,
	P1P2Boundary=$safBound1,
	P2NPVBoundary=$safBound2,
	ptscompanysafety=$safCompany,
	ptsblackflagsafety=$safBlackFlag,
	ptsblackflagsafety=$safGrayFlag,
	ptshighclass=$safHighClass,
	ptsmedclass=$safMedClass,
	ptslowclass=$safLowClass,
	ptsnopscinspection=$safNoInsp,
	ptsperpscdetention=$safDetention,
	ptsothercontrol=$safControl,
	ptscasualtypollution=$safCasualty,
	ptsmarineviolation=$safViolation,
	ptstankerpassenger=$safTankerPass,
	ptsbulkerlt10=$safLt10,
	ptsbulker10to20=$saf10to20,
	ptsbulkergt20=$safGt20,
	ptsMultiAdminChanges=$safMultiAdmin,
	mouLists='$mouList'
	WHERE userid='usericode'"; 
} else {
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

$memused = memory_get_usage(false);

//Returned data (includes queries used for debugging/development -> UNSAFE!)
//$data = array(query => $query, exectime => $totaltime, memused => $memused);

//Returned data, SAFE  
$data = array(exectime => $totaltime, memused => $memused);

echo json_encode($data, JSON_PRETTY_PRINT);
?>
