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
        $fromSources = "(SELECT Vessel_Name,IMO_No,Call_Sign,Maritime_Mobile_Service_ID,Flag,Operator,Main_Vessel_Type,Sub_Type,Gt,Dwt,Launched,Sub_Status,Builder FROM wros.tblship WHERE $searchType like ('%$searchTerm%') GROUP BY IMO_No) VESSELS";
        break;		
    case "registration":
		$fromSources = "(SELECT Port_Of_Registry,Official_Number,Sat_Com_Ansbk_Code,Flag,Sat_Com,Fishing_Number,P_and_I_ID,P_and_I_Club FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
        break;	
	case "ownCurrent":
		$fromSources = "(SELECT Owner,Owner_ID,Owner_CoD,Manager,Manager_ID,Manager_CoD,Operator,Operator_ID,Operator_CoD,Registered_Owner,Registered_Owner_ID,CoD_Registered_Owner,Technical_Manager,Technical_Manager_CoD FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "ownOriginal":
		$fromSources = "(SELECT Orig_Owner,Orig_CD_Owner,Orig_Manager,Orig_CoD_Manager,Orig_Operator,Orig_CoD_Operator,Orig_Vessel_Name,Orig_Flag FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "commercialHistory":
		$fromSources = "(SELECT PCNT,SCNT FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "class":
		$fromSources = "(SELECT Classed_By,Classed_By2,Class_Date,Classification_ID FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "surveys":
		$fromSources = "(SELECT * FROM wros.tblsurveydates WHERE LRNO like ('$imo') GROUP BY LRNO) VESSELS";
		break;
	case "conOverview":
		$fromSources = "(SELECT Subtype,Launched,Gt,Dwt FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "conStatus":
		$fromSources = "(SELECT Status FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
			break;
	case "conShipbuilder":
		$fromSources = "(SELECT Hull_Number,Hull_Type,Main_HC_Country,Main_HC_Hull_Number,Shipyard_Hull_Number,Builder_ID,ID_Main_Hull_Contractor,ID_Main_Newbuild_Contractor,Main_NBC_Country,Main_NBC_Hull_Number,Newbuilding_Price,USD_Newbuilding_Price,Builder_CoD,Builder,Main_Hull_Contractor,Main_Newbuild_Contractor,Shipyard,Shipyard_Country FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "conDetail":
		$fromSources = "(SELECT Statcode5,Main_Vessel_Type,Construction_Details,Heavy_Cargo_Strengthened,Segregated_Ballast_Tanks FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "conDimensions":
		$fromSources = "(SELECT LOA,Depth,Draft,Design,LBP,BCM,KTMH,Beam FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "conTonnages":
		$fromSources = "(SELECT Dwt,Cgt,Gt,Nrt,LDT,TPC,TPI FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "conArrangement":
		$fromSources = "(SELECT FHMD,Hatch_Sizes,Hatches,Decks,Number_of_Ramps,Ramp_1_Description,Ramp_1_Length,Ramp_1_Width,Ramp_1_SWL,Ramp_1_Clear_Opening,Ramp_2_Description,Ramp_2_Length,Ramp_2_Width,Ramp_2_SWL,Ramp_2_Clear_Opening,Ramp_3_Description,Ramp_3_Length,Ramp_3_Width,Ramp_3_SWL,Ramp_3_Clear_Opening,Fixed_Decks,Tanks_Centre,Tanks_Wing,Tanks_Slop,Tanks_Permanent_Ballast,Berths,Tween_Deck,Cabins,Work_Deck_Dimensions,Holds,Closed_Loading,Bow_Loading,Stern_Loading_Discharge,Tanks_Deck FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "cngOverview":
		$fromSources = "(SELECT Container_Arrangement,Grain,Bale,TEU FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "cngCargo":
		$fromSources = "(SELECT Grades,Tanks,Holds,Lash,Liquid,Ore,Reefer_Capacity,Reefer_TEU,Passengers,Cars,Rail_Cars,Cars_And_Trucks,Trailers,Car_Lane_Metres,Total_Lane_Metres,Track_Lane_Metres,Trailer_Lane_Metres FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "cngGears":
		$fromSources = "(SELECT Gear_type,Gear_Description,Gear_SWL,Pump_Type,Pump_Description,Pump_Rating,Pumps_Total_Capacity,Pumps_Stripping,Cargo_Pumps_1,Cargo_Pumps_1_Capacity,Cargo_Pumps_2,Cargo_Pumps_2_Capacity,Cargo_Pumps_3,Cargo_Pumps_3_Capacity FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "macPrimeMover":
		$fromSources = "(SELECT Engine_Builder,Engine_Details,Engine_Layout,Engine_Make,Engine_Model,Engine_Number_of,Engine_RPM,Engine_Speed,Engine_Stroke,Engine_HP_Total,Engine_KW_Total,Engine_Type,Type_Propulsion,Propulsion_Units,Cylinder_Bore,Cylinder_Stroke FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "macThrusters":
		$fromSources = "(SELECT Thrusters FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "claCertificates":
		$fromSources = "(SELECT CERTIFICATE_ID,INSPECTION_ID,CERTIFICATE_TITLE_CODE,CERTIFICATE_TITLE,issuing_authority,issue_date,expiry_date FROM wros.tblcertificates WHERE LRNO like ('$imo')) VESSELS";
		break;
	case "claCasualties":
		$fromSources ="(SELECT * FROM wros.tblcasualty WHERE LRNO like ('$imo')) VESSELS";
		break;
	case "claInspections":
		$fromSources = "(SELECT inspectionid,Authorisation,Country,InspectionDate,InspectionPortDecode,Manager,Owner,NumberofDaysDetained,NumberofDefects,OtherInspectionType,ReleaseDate,shipDetained,Source FROM wros.tblinspections WHERE LRIMOShipNo like ('$imo')) VESSELS";
		break;
	case "claSafety":
		$fromSources = "(SELECT IMO_Chemical_Class,Inert_Gas_System,Crude_Oil_Washing,Coils,Maximum_Temperature,Minimum_Temperature,Internal_Watertight_Doors,Heating_Type,Vapour_Recovery_System,Coats FROM wros.tblship WHERE Imo_No like ('$imo')) VESSELS";
		break;
	case "claCrew":
		$fromSources = "(SELECT id,CrewListDate,Nationality,TotalCrew,TotalRatings,TotalOfficers FROM wros.tblcrewlist WHERE lrno like ('$imo')) VESSELS";
		break;
	case "eventTimeline":
		$fromSources = "((SELECT Last_Update,Contract_Date,Keel_Laid,Due_or_Delivered,Date_Acquired,Launched,Date_Conversion,Scrap_or_Loss_Date,Recommissioned FROM wros.tblship WHERE IMO_No like ('$imo')) UNION (SELECT InspectionDate,inspectionid,Authorisation,Country,otherInspectionType,NumberofDefects,ShipDetained,Null as Col8,Null as Col9 FROM wros.tblinspections WHERE LRIMOShipNo like ('$imo'))) VESSELS";
		break;
	case "movements":
		break;
	case "performance":
		$fromSources = "(SELECT Bollard_Pull,MDO_Consumption,HFO_Consumption,Consumption_Speed FROM wros.tblship WHERE IMO_No like ('$imo') GROUP BY IMO_No) VESSELS";
		break;
	case "glossary":
		$fromSources = "(SELECT * FROM wros.tblship_definition) VESSELS";
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
			mmsi=>odbc_result($result,"Maritime_Mobile_Service_ID"),
			callSign=>htmlspecialchars(odbc_result($result,"Call_Sign")),
			flag=>htmlspecialchars(odbc_result($result,"Flag")),
            operator=>htmlspecialchars(odbc_result($result,"Operator")),
			shipType=>htmlspecialchars(odbc_result($result,"Main_Vessel_Type")),
            shipSubtype=>htmlspecialchars(odbc_result($result,"Sub_Type")),
            gross=>odbc_result($result,"Gt"),
            deadweight=>htmlspecialchars(odbc_result($result,"Dwt")),
            dateOfBuild=>htmlspecialchars(odbc_result($result,"Launched")),
            shipSubstatus=>htmlspecialchars(odbc_result($result,"Sub_Status")),
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
	} else if ($source === "ownCurrent") {
		$vessel = array(ownOwner=>htmlspecialchars(odbc_result($result,"Owner")),
			ownOwnerId=>htmlspecialchars(odbc_result($result,"Owner_ID")),
			ownOwnerCod=>htmlspecialchars(odbc_result($result,"Owner_CoD")),
			ownManager=>htmlspecialchars(odbc_result($result,"Manager")),
			ownManagerId=>htmlspecialchars(odbc_result($result,"Manager_ID")),
			ownManagerCod=>htmlspecialchars(odbc_result($result,"Manager_CoD")),
			ownOperator=>htmlspecialchars(odbc_result($result,"Operator")),
			ownOperatorId=>htmlspecialchars(odbc_result($result,"Operator_Id")),
			ownOperatorCod=>htmlspecialchars(odbc_result($result,"Operator_CoD")),
			ownRegisteredOwner=>htmlspecialchars(odbc_result($result,"Registered_Owner")),
			ownRegisteredOwnerId=>htmlspecialchars(odbc_result($result,"Registered_Owner_ID")),
			ownRegisteredOwnerCod=>htmlspecialchars(odbc_result($result,"CoD_Registered_Owner")),
			ownTechnicalManager=>htmlspecialchars(odbc_result($result,"Technical_Manager")),
			ownTechnicalManagerCod=>htmlspecialchars(odbc_result($result,"Technical_Manager_CoD"))
		);
	} else if ($source === "ownOriginal") {
		$vessel = array(ownOrigOwner=>htmlspecialchars(odbc_result($result,"Orig_Owner")),
			ownOrigOwnerCod=>htmlspecialchars(odbc_result($result,"Orig_CD_Owner")),
			ownOrigManager=>htmlspecialchars(odbc_result($result,"Orig_Manager")),
			ownOrigManagerCod=>htmlspecialchars(odbc_result($result,"Orig_CoD_Manager")),
			ownOrigOperator=>htmlspecialchars(odbc_result($result,"Orig_Operator")),
			ownOrigOperatorCod=>htmlspecialchars(odbc_result($result,"Orig_CoD_Operator")),
			ownOrigVesselName=>htmlspecialchars(odbc_result($result,"Orig_Vessel_Name")),
			ownOrigFlag=>htmlspecialchars(odbc_result($result,"Orig_Flag"))
		);
	} else if ($source === "commercialHistory") {
		$vessel = array(comPcnt=>htmlspecialchars(odbc_result($result,"PCNT")),
			comScnt=>htmlspecialchars(odbc_result($result,"SCNT"))
		);
	} else if ($source === "class") {
		$vessel = array(claClass=>htmlspecialchars(odbc_result($result,"Classed_By")),
			claClass2=>htmlspecialchars(odbc_result($result,"Classed_By2")),
			claDate=>htmlspecialchars(odbc_result($result,"Class_Date")),
			claId=>htmlspecialchars(odbc_result($result,"Classification_ID"))
		);
	
	} else if ($source === "surveys") {
		$vessel = array(surSpecial=>htmlspecialchars(odbc_result($result,"Special_Survey")),
			surLakes=>htmlspecialchars(odbc_result($result,"Special_Survey_Lakes")),
			SurHull=>htmlspecialchars(odbc_result($result,"Continuous_Hull_Survey")),
			surMachinery=>htmlspecialchars(odbc_result($result,"Continuous_Machinery_Survey")),
			surTailShaft=>htmlspecialchars(odbc_result($result,"Tail_Shaft_Survey")),
			surDocking=>htmlspecialchars(odbc_result($result,"Docking_Survey")),
			surAnnual=>htmlspecialchars(odbc_result($result,"Annual_Survey")),
			surClassSociety=>htmlspecialchars(odbc_result($result,"Class_Society"))
		);
	} else if ($source === "conOverview") {
		$vessel = array(conOverviewShiptype=>htmlspecialchars(odbc_result($result,"Subtype")),
			conOverviewLaunched=>htmlspecialchars(odbc_result($result,"Launched")),
			conOverviewGT=>htmlspecialchars(odbc_result($result,"Gt")),
			conOverviewDWT=>htmlspecialchars(odbc_result($result,"Dwt"))
		);
	} else if ($source === "conShipbuilder") {
		$vessel = array(conHullNo=>htmlspecialchars(odbc_result($result,"Hull_Number")),
			conHullType=>htmlspecialchars(odbc_result($result,"Hull_Type")),
			conMainHcCod=>htmlspecialchars(odbc_result($result,"Main_HC_Country")),
			conMainHcHullNo=>htmlspecialchars(odbc_result($result,"Main_HC_Hull_Number")),
			conShipyardHullNo=>htmlspecialchars(odbc_result($result,"Shipyard_Hull_Number")),
			conBuilderId=>htmlspecialchars(odbc_result($result,"Builder_ID")),
			conMainHcId=>htmlspecialchars(odbc_result($result,"ID_Main_Hull_Contractor")),
			conMainNbcId=>htmlspecialchars(odbc_result($result,"ID_Main_Newbuild_Contractor")),
			conMainNbcCod=>htmlspecialchars(odbc_result($result,"Main_NBC_Country")),
			conMainNbcHullNo=>htmlspecialchars(odbc_result($result,"Main_NBC_Hull_Number")),
			conNbcPrice=>htmlspecialchars(odbc_result($result,"Newbuilding_Price")),
			conNbcPriceUsd=>htmlspecialchars(odbc_result($result,"USD_Newbuilding_Price")),
			conBuilderCod=>htmlspecialchars(odbc_result($result,"Builder_CoD")),
			conBuilder=>htmlspecialchars(odbc_result($result,"Builder")),
			conMainHc=>htmlspecialchars(odbc_result($result,"Main_Hull_Contractor")),
			conMainNbc=>htmlspecialchars(odbc_result($result,"Main_Newbuild_Contractor")),
			conShipyard=>htmlspecialchars(odbc_result($result,"Shipyard")),
			conShipyardCountry=>htmlspecialchars(odbc_result($result,"Shipyard_Country"))
		);
	} else if ($source === "conStatus") {
		$vessel = array(
			conStatus=>htmlspecialchars(odbc_result($result,"Status"))
		);
	} else if ($source === "conDetail") {
		$vessel = array(conDetStatcode5=>htmlspecialchars(odbc_result($result,"Statcode5")),
			conDetShiptype=>htmlspecialchars(odbc_result($result,"Main_Vessel_Type")),
			conDetDetail=>htmlspecialchars(odbc_result($result,"Construction_Details")),
			conDetHeavyCargo=>htmlspecialchars(odbc_result($result,"Heavy_Cargo_Strengthed")),
			conDetBallastTanks=>htmlspecialchars(odbc_result($result,"Segregated_Ballast_Tanks"))
		);
	} else if ($source === "conDimensions") {
		$vessel = array(conDesign=>htmlspecialchars(odbc_result($result,"Design")),
			conLength=>htmlspecialchars(odbc_result($result,"LOA")),
			conDepth=>htmlspecialchars(odbc_result($result,"Depth")),
			conDraft=>htmlspecialchars(odbc_result($result,"Draft")),	
			conLBP=>htmlspecialchars(odbc_result($result,"LBP")),
			conBCM=>htmlspecialchars(odbc_result($result,"BCM")),
			conKTMH=>htmlspecialchars(odbc_result($result,"KTMH")),
			conBeam=>htmlspecialchars(odbc_result($result,"Beam"))
		);
	} else if ($source === "conTonnages") {
		$vessel = array(conTonGt=>htmlspecialchars(odbc_result($result,"Gt")),
			conTonDwt=>htmlspecialchars(odbc_result($result,"Dwt")),
			conTonNrt=>htmlspecialchars(odbc_result($result,"Nrt")),
			conTonCgt=>htmlspecialchars(odbc_result($result,"Cgt")),
			conTonLdt=>htmlspecialchars(odbc_result($result,"LDT")),
			conTonTpc=>htmlspecialchars(odbc_result($result,"TPC")),
			conTonTpi=>htmlspecialchars(odbc_result($result,"TPI"))
		);
	} else if ($source === "conArrangement") {
		$vessel = array(conArrFhmd=>htmlspecialchars(odbc_result($result,"FHMD")),
			conArrHatchSize=>htmlspecialchars(odbc_result($result,"Hatch_Sizes")),
			conArrHatches=>htmlspecialchars(odbc_result($result,"Hatches")),
			conArrDecks=>htmlspecialchars(odbc_result($result,"Decks")),
			conArrRamps=>htmlspecialchars(odbc_result($result,"Number_of_Ramps")),
			conArrRamp1D=>htmlspecialchars(odbc_result($result,"Ramp_1_Description")),
			conArrRamp1L=>htmlspecialchars(odbc_result($result,"Ramp_1_Length")),
			conArrRamp1W=>htmlspecialchars(odbc_result($result,"Ramp_1_Width")),
			conArrRamp1Swl=>htmlspecialchars(odbc_result($result,"Ramp_1_SWL")),
			conArrRamp1Co=>htmlspecialchars(odbc_result($result,"Ramp_1_Clear_Opening")),
			conArrRamp2D=>htmlspecialchars(odbc_result($result,"Ramp_2_Description")),
			conArrRamp2L=>htmlspecialchars(odbc_result($result,"Ramp_2_Length")),
			conArrRamp2W=>htmlspecialchars(odbc_result($result,"Ramp_2_Width")),
			conArrRamp2Swl=>htmlspecialchars(odbc_result($result,"Ramp_2_SWL")),
			conArrRamp2Co=>htmlspecialchars(odbc_result($result,"Ramp_2_Clear_Opening")),
			conArrRamp3D=>htmlspecialchars(odbc_result($result,"Ramp_3_Description")),
			conArrRamp3L=>htmlspecialchars(odbc_result($result,"Ramp_3_Length")),
			conArrRamp3W=>htmlspecialchars(odbc_result($result,"Ramp_3_Width")),
			conArrRamp3Swl=>htmlspecialchars(odbc_result($result,"Ramp_3_SWL")),
			conArrRamp3Co=>htmlspecialchars(odbc_result($result,"Ramp_3_Clear_Opening")),
			conArrFixedDecks=>htmlspecialchars(odbc_result($result,"Fixed_Decks")),
			conArrTanksCenter=>htmlspecialchars(odbc_result($result,"Tanks_Centre")),
			conArrTanksWing=>htmlspecialchars(odbc_result($result,"Tanks_Wing")),
			conArrTanksSlop=>htmlspecialchars(odbc_result($result,"Tanks_Slop")),
			conArrTanksPerm=>htmlspecialchars(odbc_result($result,"Tanks_Permanent_Ballast")),
			conArrBerths=>htmlspecialchars(odbc_result($result,"Berths")),
			conArrTweenDecks=>htmlspecialchars(odbc_result($result,"Tween_Deck")),
			conArrCabins=>htmlspecialchars(odbc_result($result,"Cabins")),
			conArrWhd=>htmlspecialchars(odbc_result($result,"Work_Deck_Dimensions")),
			conArrHolds=>htmlspecialchars(odbc_result($result,"Holds")),
			conArrClosedLoading=>htmlspecialchars(odbc_result($result,"Closed_Loading")),
			conArrBowLoading=>htmlspecialchars(odbc_result($result,"Bow_Loading")),
			conArrSternLoading=>htmlspecialchars(odbc_result($result,"Stern_Loading_Discharge")),
			conArrTanksDeck=>htmlspecialchars(odbc_result($result,"Tanks_Deck"))
		);
	} else if ($source === "cngOverview") {
		$vessel = array(cngArrangement=>htmlspecialchars(odbc_result($result,"Container_Arrangement")),
			cngGrain=>htmlspecialchars(odbc_result($result,"Grain")),
			cngBale=>htmlspecialchars(odbc_result($result,"Bale")),
			cngTeu=>htmlspecialchars(odbc_result($result,"TEU"))
		);
	} else if ($source === "cngCargo") {
		$vessel = array(cngCargoGrades=>htmlspecialchars(odbc_result($result,"Grades")),
			cngCargoTanks=>htmlspecialchars(odbc_result($result,"Tanks")),
			cngCargoHolds=>htmlspecialchars(odbc_result($result,"Holds")),
			cngCargoLash=>htmlspecialchars(odbc_result($result,"Lash")),
			cngCargoLiquid=>htmlspecialchars(odbc_result($result,"Liquid")),
			cngCargoOre=>htmlspecialchars(odbc_result($result,"Ore")),
			cngCargoReeferCap=>htmlspecialchars(odbc_result($result,"Reefer_Capacity")),
			cngCargoReeferTeu=>htmlspecialchars(odbc_result($result,"Reefer_TEU")),
			cngCargoPassengers=>htmlspecialchars(odbc_result($result,"Passengers")),
			cngCargoCars=>htmlspecialchars(odbc_result($result,"Cars")),
			cngCargoRailCars=>htmlspecialchars(odbc_result($result,"Rail_Cars")),
			cngCargoCarsAndTrucks=>htmlspecialchars(odbc_result($result,"Cars_And_Trucks")),
			cngCargoTrailers=>htmlspecialchars(odbc_result($result,"Trailers")),
			cngCargoCarLM=>htmlspecialchars(odbc_result($result,"Car_Lane_Metres")),
			cngCargoTotalLM=>htmlspecialchars(odbc_result($result,"Total_Lane_Metres")),
			cngCargoTrackLM=>htmlspecialchars(odbc_result($result,"Track_Lane_Metres")),
			cngCargoTrailerLM=>htmlspecialchars(odbc_result($result,"Trailer_Lane_Metres"))
		);
	} else if ($source === "cngGears") {
		$vessel = array(cngGearType=>htmlspecialchars(odbc_result($result,"Gear_type")),
			cngGearDesc=>htmlspecialchars(odbc_result($result,"Gear_Description")),
			cngGearSWL=>htmlspecialchars(odbc_result($result,"Gear_SWL")),
			cngPumpType=>htmlspecialchars(odbc_result($result,"Pump_Type")),
			cngPumpDesc=>htmlspecialchars(odbc_result($result,"Pump_Description")),
			cngPumpRating=>htmlspecialchars(odbc_result($result,"Pump_Rating")),
			cngPumpsTotalCap=>htmlspecialchars(odbc_result($result,"Pumps_Total_Capacity")),
			cngPumpsStripping=>htmlspecialchars(odbc_result($result,"Pumps_Stripping")),
			cngCargoPumps1=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_1")),
			cngCargoPumps1Cap=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_1_Capacity")),
			cngCargoPumps2=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_2")),
			cngCargoPumps2Cap=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_2_Capacity")),
			cngCargoPumps3=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_3")),
			cngCargoPumps3Cap=>htmlspecialchars(odbc_result($result,"Cargo_Pumps_3_Capacity"))
		);
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
			macEngineType=>htmlspecialchars(odbc_result($result,"Engine_Type")),
			macPropulsionType=>htmlspecialchars(odbc_result($result,"Type_Propulsion")),
			macPropulsionUnits=>htmlspecialchars(odbc_result($result,"Propulsion_Units")),
			macCylinderBore=>htmlspecialchars(odbc_result($result,"Cylinder_Bore")),
			macCylinderStroke=>htmlspecialchars(odbc_result($result,"Cylinder_Stroke"))
		); 
	} else if ($source === "macThrusters") {
		$vessel = array(
			macThrusters=>htmlspecialchars(odbc_result($result,"Thrusters"))
		);
	} else if ($source === "claSafety") {
		$vessel = array(claSafetyChemical=>htmlspecialchars(odbc_result($result,"IMO_Chemical_Class")),
			claSafetyInertGas=>htmlspecialchars(odbc_result($result,"Inert_Gas_System")),
			claSafetyOilWashing=>htmlspecialchars(odbc_result($result,"Crude_Oil_Washing")),
			claSafetyVapourRecovery=>htmlspecialchars(odbc_result($result,"Vapour_Recovery_System")),
			claSafetyWatertightDoors=>htmlspecialchars(odbc_result($result,"Internal_Watertight_Doors")),
			claSafetyCoils=>htmlspecialchars(odbc_result($result,"Coils")),
			claSafetyHeatingType=>htmlspecialchars(odbc_result($result,"Heating_Type")),
			claSafetyMaxTemp=>htmlspecialchars(odbc_result($result,"Maximum_Temperature")),
			claSafetyMinTemp=>htmlspecialchars(odbc_result($result,"Minimum_Temperature")),
			claSafetyCoats=>htmlspecialchars(odbc_result($result,"Coats"))
		);
	} else if ($source === "claCasualties") {
		$vessel = array(claCasName=>htmlspecialchars(odbc_result($result,"Name_At_Time")),			
			claCasCallSign=>htmlspecialchars(odbc_result($result,"CALL_At_Time")),
			claCasTypeA=>htmlspecialchars(odbc_result($result,"Vessel_Type_A")),
			claCasTypeB=>htmlspecialchars(odbc_result($result,"Vessel_Type_B")),
			claCasBuild=>htmlspecialchars(odbc_result($result,"YOB")),
			claCasStatus=>htmlspecialchars(odbc_result($result,"Status_At_Time")),
			claCasFlag=>htmlspecialchars(odbc_result($result,"Flag_At_Time")),
			claCasOwner=>htmlspecialchars(odbc_result($result,"Owner_At_Time")),
			claCasClass1=>htmlspecialchars(odbc_result($result,"Class_1_At_Time")),
			claCasClass2=>htmlspecialchars(odbc_result($result,"Class_2_At_Time")),						
			claCasGt=>htmlspecialchars(odbc_result($result,"GT_At_Time")),
			claCasDwt=>htmlspecialchars(odbc_result($result,"DWT_At_Time")),
			claCasPropulsion=>htmlspecialchars(odbc_result($result,"Prop_Type")),
			claCasLocation=>htmlspecialchars(odbc_result($result,"Enviro_Loc")),
			claCasPort1=>htmlspecialchars(odbc_result($result,"Start_Port")),
			claCasPort2=>htmlspecialchars(odbc_result($result,"Port_Decode")),
			claCasVoyStart=>htmlspecialchars(odbc_result($result,"Voy_From")),
			claCasVoyEnd=>htmlspecialchars(odbc_result($result,"Voy_To")),
			claCasLatDeg=>htmlspecialchars(odbc_result($result,"Lat_Deg")),
			claCasLatMin=>htmlspecialchars(odbc_result($result,"Lat_Min")),
			claCasLatSec=>htmlspecialchars(odbc_result($result,"Lat_Sec")),
			claCasLatDir=>htmlspecialchars(odbc_result($result,"Lat_Dir")),
			claCasLonDeg=>htmlspecialchars(odbc_result($result,"Lon_Deg")),
			claCasLonMin=>htmlspecialchars(odbc_result($result,"Lon_Min")),
			claCasLonSec=>htmlspecialchars(odbc_result($result,"Lon_Sec")),
			claCasLonDir=>htmlspecialchars(odbc_result($result,"Lon_Dir")),
			claCasDateStart=>htmlspecialchars(odbc_result($result,"Start_Date")),
			claCasDateReported=>htmlspecialchars(odbc_result($result,"First_Reported")),
			claCasSeverity=>htmlspecialchars(odbc_result($result,"Severity_Ind")),
			claCasCasualty=>htmlspecialchars(odbc_result($result,"Casualty_Grouping")),
			claCasMarsdenStart=>htmlspecialchars(odbc_result($result,"Marsden_Grid_St")),
			claCasMarsdenEnd=>htmlspecialchars(odbc_result($result,"Marsden_Grid_End")),
			claCasSisZone=>htmlspecialchars(odbc_result($result,"SIS_ZONE")),
			claCasReport1=>htmlspecialchars(odbc_result($result,"Precis_Txt")),
			claCasReport2=>htmlspecialchars(odbc_result($result,"Comp_Txt")),
			claCasPollInd=>htmlspecialchars(odbc_result($result,"Pollution_Ind")),
			claCasPollType=>htmlspecialchars(odbc_result($result,"Pollution_Type")),
			claCasPollUnit=>htmlspecialchars(odbc_result($result,"Pollution_Units")),
			claCasPollQty=>htmlspecialchars(odbc_result($result,"Pollution_QTY")),
			claCasKillInd=>htmlspecialchars(odbc_result($result,"Killed_Ind")),
			claCasKillNo=>htmlspecialchars(odbc_result($result,"Killed_No")),
			claCasKillDate=>htmlspecialchars(odbc_result($result,"Death_Date")),
			claCasMissingInd=>htmlspecialchars(odbc_result($result,"Missing_Ind")),
			claCasMissingNo=>htmlspecialchars(odbc_result($result,"Missing_No")),
			claCasCargoText=>htmlspecialchars(odbc_result($result,"Cargo_Txt")),
			claCasCargoStatus=>htmlspecialchars(odbc_result($result,"Cargo_Status"))
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
	} else if ($source === "claCertificates") {
		$vessel = array(claCertId=>htmlspecialchars(odbc_result($result,"CERTIFICATE_ID")),
			claCertInsp=>htmlspecialchars(odbc_result($result,"INSPECTION_ID")),
			claCertCode=>htmlspecialchars(odbc_result($result,"CERTIFICATE_TITLE_CODE")),
			claCertTitle=>htmlspecialchars(odbc_result($result,"CERTIFICATE_TITLE")),
			claCertIssueAuthority=>htmlspecialchars(odbc_result($result,"issuing_authority")),
			claCertIssueDate=>htmlspecialchars(odbc_result($result,"issue_date")),
			claCertExpiryDate=>htmlspecialchars(odbc_result($result,"expiry_date"))
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
		$vessel = array(dateLastUpdate=>htmlspecialchars(odbc_result($result,"Last_Update")),
			dateContract=>htmlspecialchars(odbc_result($result,"Contract_Date")),
			dateKeelLaid=>htmlspecialchars(odbc_result($result,"Keel_Laid")),
			dateDueOrDelivered=>htmlspecialchars(odbc_result($result,"Due_or_Delivered")),
			dateAcquired=>htmlspecialchars(odbc_result($result,"Date_Acquired")),	
			dateLaunched=>htmlspecialchars(odbc_result($result,"Launched")),
			dateConversion=>htmlspecialchars(odbc_result($result,"Date_Conversion")),
			dateScrapOrLoss=>htmlspecialchars(odbc_result($result,"Scrap_or_Loss_Date")),
			dateRecommissioned=>htmlspecialchars(odbc_result($result,"Recommissioned"))
		 );
	} else if ($source === "performance") {
		$vessel = array(perBollard=>htmlspecialchars(odbc_result($result,"Bollard_Pull")),
			perMdo=>htmlspecialchars(odbc_result($result,"MDO_Consumption")),
			perHfo=>htmlspecialchars(odbc_result($result,"HFO_Consumption")),
			perSpeed=>htmlspecialchars(odbc_result($result,"ConsumptionSpeed"))
		);
	} else if ($source === "glossary") {
		$vessel = array(gloFieldName=>htmlspecialchars(odbc_result($result,"Field_Name")),
			gloDesc=>htmlspecialchars(odbc_result($result,"Description"))
		);
  } else {
	/*
		} else if ($source === "performance") {
		$vessel = array(=>htmlspecialchars(odbc_result($result,"")),
			=>htmlspecialchars(odbc_result($result,"")),
			=>htmlspecialchars(odbc_result($result,""))
		);
	*/
	}

	array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vesseldata => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

