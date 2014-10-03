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
$source = (string)$_GET["source"];
if ($source != 'initialize') {
	$imo = (string)$_GET["imo"];
} else {
	$searchType = (string)$_GET["searchType"];
	$searchTerm = (string)$_GET["searchTerm"];
	
	if ($searchType == "selectShipName") {
		$searchType = "Vessel_Name";
	} else if ($searchType == "selectImo") {
		$searchType = "IMO_No";
	} else if ($searchType == "selectMmsi") {
		$searchType = "Maritime_Mobile_Service_ID";
	}
}

// Build query statement
switch ($source) {
    case "initialize":
        $fromSources = "(SELECT Vessel_Name,IMO_No,Call_Sign,Maritime_Mobile_Service_ID,Flag,Operator,Subtype,Gt,Dwt,Launched,Sub_Status,Builder FROM wros.tblship WHERE $searchType like ('$searchTerm') GROUP BY IMO_No) VESSELS";
        break;		
    case "registration":
		$fromSources = "(SELECT Port_Of_Registry,Official_Number,Sat_Com_Ansbk_Code,Flag,Sat_Com,Fishing_Number,P_and_I_ID,P_and_I_Club FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
        break;	
	case "ownership":
		$fromSources = "(SELECT Owner,Manager,Operator,DOC,Registered_Owner,Technical_Manager,DOC_ID, Registered_Owner_ID FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "commercialHistory":
		$fromSources = "(SELECT  FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "class":
		break;
	case "surveys":
		break;
	case "construction":
		break;
	case "cargoAndGear":
		break;
	case "macPrimeMover":
		$fromSources = "(SELECT Engine_Builder,Engine_Details,Engine_Layout,Engine_Make,Engine_Model,Engine_Number_of,Engine_RPM,Engine_Speed,Engine_Stroke,Engine_HP_Total,Engine_KW_Total,Engine_Type FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "claInspections":
		$fromSources = "(SELECT inspectionid,Authorisation,Country,InspectionDate,InspectionPortDecode,Manager,Owner,NumberofDaysDetained,NumberofDefects,OtherInspectionType,ReleaseDate,shipDetained,Source FROM wros.tblinspections WHERE LRIMOShipNo like ('$imo')) VESSELS";
		break;
	case "claCrew":
		$fromSources = "(SELECT id,CrewListDate,Nationality,TotalCrew,TotalRatings,TotalOfficers FROM wros.tblcrewlist WHERE lrno like ('$imo')) VESSELS";
		break;
	case "eventTimeline":
		break;
	case "movements":
		break;
	case "fixtures":
		break;
	case "shipPerformance":
		$imo = (string)$_GET["imo"];
		$fromSources = "
		(SELECT 
		
		FROM wros.tblship 
		WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	default: 
        break;
}

//Query statement - default statement unless user inputs custom statement
$query = "SELECT * FROM " . $fromSources;

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
   if ($source === "initialize") {  
        $vessel = array(shipName=>htmlspecialchars(odbc_result($result,"Vessel_Name")),
            imo=>odbc_result($result,"IMO_No"),
			callSign=>htmlspecialchars(odbc_result($result,"Call_Sign")),
			mmsi=>odbc_result($result,"Maritime_Mobile_Service_ID"),
			flag=>htmlspecialchars(odbc_result($result,"Flag")),
            operator=>htmlspecialchars(odbc_result($result,"Operator")),
            shipType=>htmlspecialchars(odbc_result($result,"Subtype")),
            gross=>odbc_result($result,"Gt"),
            deadweight=>htmlspecialchars(odbc_result($result,"Dwt")),
            dateOfBuild=>htmlspecialchars(odbc_result($result,"Launched")),
            shipStatus=>htmlspecialchars(odbc_result($result,"Sub_Status")),
			shipBuilder=>htmlspecialchars(odbc_result($result,"Builder"))
        );
		$imo = imo;
	} else if ($source === "registration") {
		$vessel = array(regPortOfRegistry=>htmlspecialchars(odbc_result($result,"Port_Of_Registry")),
			regOfficialNumber=>htmlspecialchars(odbc_result($result,"Official_Number")),
			regSatComAnsbkCode=>htmlspecialchars(odbc_result($result,"Sat_Com_Ansbk_Code")),
			regFlag=>htmlspecialchars(odbc_result($result,"Flag")),
			regSatCom=>htmlspecialchars(odbc_result($result,"Sat_Com")),
			regFishingNumber=>htmlspecialchars(odbc_result($result,"Fishing_Number")),
			regPandiId=>htmlspecialchars(odbc_result($result,"P_and_I_ID")),
			regPandiClub=>htmlspecialchars(odbc_result($result,"P_and_I_Club"))
		);
	} else if ($source === "ownership") {
		$vessel = array(ownOwner=>htmlspecialchars(odbc_result($result,"Owner")),
			ownManager=>htmlspecialchars(odbc_result($result,"Manager")),
			ownOperator=>htmlspecialchars(odbc_result($result,"Operator")),
			ownDoc=>htmlspecialchars(odbc_result($result,"DOC")),
			ownRegisteredOwner=>htmlspecialchars(odbc_result($result,"Registered_Owner")),
			ownTechnicalManager=>htmlspecialchars(odbc_result($result,"Technical_Manager")),
			ownDocId=>htmlspecialchars(odbc_result($result,"DOC_ID")),
			ownRegisteredOwnerId=>htmlspecialchars(odbc_result($result,"Registered_Owner_ID"))
		);
	} else if ($source === "commercialHistory") {
	} else if ($source === "class") {
	} else if ($source === "surveys") {
	} else if ($source === "construction") {
	} else if ($source === "cargoAndGear") {
	} else if ($source === "macPrimeMover") {
		$vessel = array(macEngineBuilder=>htmlspecialchars(odbc_result($result,"Engine_Builder")),
			macEngineDetails=>htmlspecialchars(odbc_result($result,"Engine_Details")),
			macEngineLayout=>htmlspecialchars(odbc_result($result,"Engine_Layout")),
			macEngineMake=>htmlspecialchars(odbc_result($result,"Engine_Make")),
			macEngineModel=>htmlspecialchars(odbc_result($result,"Engine_Model")),
			macEngineNumber=>htmlspecialchars(odbc_result($result,"Engine_Number_of")),
			macEngineRPM=>htmlspecialchars(odbc_result($result,"Engine_RPM")),
			macEngineSpeed=>htmlspecialchars(odbc_result($result,"Engine_Speed")),
			macEngineStroke=>htmlspecialchars(odbc_result($result,"Engine_Stroke")),
			macEngineHP=>htmlspecialchars(odbc_result($result,"Engine_HP_Total")),
			macEngineKW=>htmlspecialchars(odbc_result($result,"Engine_KW_Total")),
			macEngineType=>htmlspecialchars(odbc_result($result,"Engine_Type"))
		); 
	} else if ($source === "claInspections") {
		$vessel = array(claInspId=>htmlspecialchars(odbc_result($result,"inspectionid")),
			claInspAuthorisation=>htmlspecialchars(odbc_result($result,"Authorisation")),
			claInspCountry=>htmlspecialchars(odbc_result($result,"Country")),
			claInspDate=>htmlspecialchars(odbc_result($result,"InspectionDate")),
			claInspPort=>htmlspecialchars(odbc_result($result,"InspectionPortDecode")),
			claInspManager=>htmlspecialchars(odbc_result($result,"Manager")),
			claInspOwner=>htmlspecialchars(odbc_result($result,"Owner")),
			claInspDaysDetained=>htmlspecialchars(odbc_result($result,"NumberofDaysDetained")),
			claInspDefects=>htmlspecialchars(odbc_result($result,"NumberofDefects")),
			claInspType=>htmlspecialchars(odbc_result($result,"OtherInspectionType")),
			claInspReleaseDate=>htmlspecialchars(odbc_result($result,"ReleaseDate")),
			claInspDetained=>htmlspecialchars(odbc_result($result,"shipDetained")),
			claInspSource=>htmlspecialchars(odbc_result($result,"Source"))
		);
	} else if ($source === "claCrew") {
		$vessel = array(claCrewId=>htmlspecialchars(odbc_result($result,"id")),
			claCrewDate=>htmlspecialchars(odbc_result($result,"CrewListDate")),
			claCrewNationality=>htmlspecialchars(odbc_result($result,"Nationality")),
			claCrewTotal=>htmlspecialchars(odbc_result($result,"TotalCrew")),
			claCrewOfficers=>htmlspecialchars(odbc_result($result,"TotalOfficers")),
			claCrewRatings=>htmlspecialchars(odbc_result($result,"TotalRatings"))
		); 
	} else if ($source === "eventTimeline") {
	} else if ($source === "movements") {
	} else if ($source === "fixtures") {
	/*
	} else if ($source === "shipPerformance") {
		$vessel = array(=>htmlspecialchars(odbc_result($result,"")),
			=>htmlspecialchars(odbc_result($result,"")),
			=>htmlspecialchars(odbc_result($result,""))
		);
	*/
    } else {
	}
	
	array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vesseldata => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

