/**
 * @name ICODE-MDA Maps
 * @author Sparta Cheung, Bryan Bagnall, Lynne Tablewski
 * @fileoverview
 * Uses the Google Maps API to display layers of maritime data at their reported locations
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
var map;                      //main Google Map object

var reloadDelay;              //milliseconds to wait before refreshing the markers after map idle

//parallel arrays to keep track of displayed tracks
var tracksDisplayedID = [];   //stores MMSI/trknum of tracks that are displayed
var tracksDisplayed = [];     //stores track objects of tracks that are displayed 

//Trackline options
var showtrackicons;
/*
var tracklineIconsOptions = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FFFFFF',
               fillColor:     '#FFFFFF',
               fillOpacity:   1
            };
*/
var tracklineIconsOptionsQ = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FFFF00',
               fillColor:     '#FFFF00',
               fillOpacity:   1
            };
var tracklineIconsOptionsT = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#00FF00',
               fillColor:     '#00FF00',
               fillOpacity:   1
            };
var tracklineIconsOptionsL = {
               path:          'M -5,0 0,-5 5,0 0,5 z',
               strokeColor:   '#FF0000',
               fillColor:     '#FF0000',
               fillOpacity:   1
            };

var mainQuery;                //main query called

//Vessel type filter
var vesseltypeFilterPHPStr = '';

//Cluster boxes for zoomed out view of vessel count instead of showing markers
//var clusterBoxes = [];        
//var clusterBoxesLabels= [];
var enableCluster;

var autoRefreshHandler;              //interval event handler of map auto refresh
var autoRefreshRate;          //rate of auto refreshing
var lastRefresh;              //time of last map refresh
var vesselLastUpdated;        //time of last vessel report

var distanceLabel;            //text label for distance tool

//Vessel marker size
var vw = 4;                   //vessel marker width
var vl = 10;                  //vessel marker length

//info bubble to show vessel particulars (details)
var infoBubble = new InfoBubble({
       disableAnimation: true,
       disableAutoPan:   true,
       arrowStyle:       2,
       padding:          '8px',
       borderRadius:     10,
       minWidth: 380,
       minHeight: 400,
       //maxWidth:         400,
       //minHeight:        360
   });

var vessel_age;               //user chosen vessel age, in hours

var history_trail_length;     //user chosen history trail length, in days

//Viewing bounds objects
var viewBounds;               //map bounds object with min/max lat/lon
var expandFactor = 300;       //factor to expand bounds by outside of viewable area
var boundRectangle = null;    //rectangle map object to draw query bounds

//Enable risk info flag
var enableRisk;               //Flag to enable or disable risk information in info bubbles

//Enable FMV data
var fmvinfowindow = new google.maps.InfoWindow({});;

//IHS Tabs global
var NUM_INFO_BUBBLE = 4;      //AIS info at Tab=0 and IHS Fairplay data at  Tab = 1 thru 4
var enableIHSTabs;            //Flag to enable or disable IHS tabs in info bubbles

//Heatmap objects
var HEATMAP = true;
var heatmapLayer;

//Other WMS layers
var WMSTILESIZE = 512;

//Shape drawing objects
var selectedShape;

//KML objects
var KML = false;
var tempKMLcount = 0;

//Port objects
var Ports = false;

//Distance measurement
var latLng;
var prevlatLng;
var distIcon;
var prevdistIcon;
var distPath;
var distIconsOptions = {
               path:          'M -4,0 0,-4 4,0 0,4 z',
               strokeColor:   '#04B4AE',
               fillColor:     '#04B4AE',
               fillOpacity:   1
            };

//Time Machine
//var TimeMachineStart;
var TimeMachineEnd = null;

//Custom search/query
var enableCustomQuery;
var queryCustomQuery;
var searchTerm = '';
var aisDisplayed = false;
var advancedSearchEnabled = false;

//LAISIC Tables selection
var selectionCircleInitOption = {
            center:  new google.maps.LatLng(0,0),
            radius: 2000,
            strokeColor: "#FF0000",
            strokeOpacity: 0.1,
            strokeWeight: 0,
            fillColor: "#FF0000",
            fillOpacity: 0.8,//0.1,
            map: null
         };
var selectionCircle = new google.maps.Circle({
            center:  new google.maps.LatLng(0,0),
            radius: 2000,
            strokeColor: "#FF0000",
            strokeOpacity: 0.1,
            strokeWeight: 0,
            fillColor: "#FF0000",
            fillOpacity: 0.8,//0.1,
            map: null
         });
var fadeInterval;
//Highlight selection from tables
//  Need to use MarkerImage object instead of straight icon pointing to image so that
//  we can set the center point of the image manually
var squareImage = new google.maps.MarkerImage('icons/selected.png',
                new google.maps.Size(35, 35),
                new google.maps.Point(0, 0),
                new google.maps.Point(15, 18));
var selectionSquare = new google.maps.Marker({
            position: new google.maps.LatLng(0,0),
            map: null,
            icon: squareImage, //'icons/selected.png',
            title: '',
            zIndex: 0
         });

//Volpe's KMZ layers for EEZ and country borders
var COMMON_PATH = "https://mda.volpe.dot.gov/overlays/";
var EEZ_PATH = COMMON_PATH + "eez-layer.kmz";
var COUNTRY_BORDERS_PATH = COMMON_PATH + "Country_Borders.kmz";

//Geocoder
var geocoder;

//Browser focus
var browserFocus = true;
var queuedRefresh = false;


/* -------------------------------------------------------------------------------- */
/** Initialize, called on main page load
*/
function initialize() {
   //Set up map properties
   //var centerCoord = new google.maps.LatLng(0,0);
   //var centerCoord = new google.maps.LatLng(32.72,-117.2319);   //Point Loma
   //var centerCoord = new google.maps.LatLng(6.0,1.30);   //Lome, Togo
   //var centerCoord = new google.maps.LatLng(2.0,1.30);     //GoG
   //var centerCoord = new google.maps.LatLng(-33.0, -71.6);   //Valparaiso, Chile
   //var centerCoord = new google.maps.LatLng(17.978677, -16.078958);   //Nouakchott, Mauritania
   var centerCoord = new google.maps.LatLng(13.273461807246479, -13.465625000000037);   //Zoomed out world view
   
   /* Uses browser location to fill in more precise user location in the geocode box
    * currently disabled to prevent annoying browser warning messages
    */
   /*
   if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
         var pos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
         );

         //Set the center location
         centerCoords = pos;
         //map.setCenter(centerCoords);

         var geocoder = new google.maps.Geocoder();
         geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               if (results[1]) {
                  $('#geocodeAddress').val(results[1].formatted_address);
               } else {
                  console.log('Geocoded address not found');
                  $('#geocodeAddress').val('San Diego, CA');
               }
            } else {
               console.log('Geocoder failed due to: ' + status);
            }            
         });
      }, function() {
         console.log('Browser does not support geolocation');
         //handleNoGeolocation(true);
      });
   }
   */

   //Detect iPhone or Android devices and set map to 100%
   var controlStyle;
   var defaultZoom;
   if (detectMobileBrowser()) {
      controlStyle = google.maps.MapTypeControlStyle.DROPDOWN_MENU;
      //defaultZoom = 8;
      defaultZoom = 2;
   }
   else {
      controlStyle = google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
      //defaultZoom = 11;
      //defaultZoom = 7;
      defaultZoom = 2;
   }
      
   var mapOptions = {
      zoom:              defaultZoom,
      center:            centerCoord,
      scaleControl:      true,
      streetViewControl: false,
      overviewMapControl:true,
      zoomControl:       detectMobileBrowser() ? false : true,
      zoomControlOptions: {
         position:       google.maps.ControlPosition.LEFT_CENTER
      },
      //overviewMapControlOptions: {opened: true},
      //keyboardShortcuts: false,
      mapTypeId:         google.maps.MapTypeId.HYBRID,
      mapTypeControlOptions: {
         mapTypeIds:     [google.maps.MapTypeId.ROADMAP, 
                          google.maps.MapTypeId.SATELLITE, 
                          google.maps.MapTypeId.HYBRID, 
                          google.maps.MapTypeId.TERRAIN,
                          'OpenStreetMap'
                         ],
			style:          controlStyle,
         position:       google.maps.ControlPosition.LEFT_BOTTOM
   	},
      minZoom:           detectMobileBrowser() ? 1 : 3,
      maxZoom:           19,
      panControl:        false,
	};

	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

   //Set default map layer
   map.setMapTypeId(google.maps.MapTypeId.HYBRID);

   //Define OSM map type pointing at the OpenStreetMap tile server
   map.mapTypes.set("OpenStreetMap", new google.maps.ImageMapType({
      getTileUrl: function(coord, zoom) {
         return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      name: "OpenStreetMap",
      maxZoom: 18
   }));

   //Display count up timer from last update
   lastRefresh = new Date();
   setInterval(function () {
      //console.log("Updated " + (new Date() - lastRefresh)/1000 + " secs ago.");
      document.getElementById('lastUpdatedText').innerHTML = "Last updated " + Math.round((new Date() - lastRefresh)/1000) + " secs ago";
      }, 1000);

   //Add drawing toolbar
   if (!detectMobileBrowser()) {
      addDrawingManager();
   }
   
   reloadDelay = 1000;    //set initial delay to 10ms

   //Get requested view and layers from URL
   if (Request.QueryString('center').Count() > 0) {
      var center = Request.QueryString('center').toString().split(',');
      map.panTo(new google.maps.LatLng(center[0], center[1]));
   }
   if (Request.QueryString('zoom').Count() > 0) {
      var zoom = Request.QueryString('zoom').toString();
      map.setZoom(parseInt(zoom));
   }
   if (Request.QueryString('layers').Count() > 0) {
      var requestedLayers = Request.QueryString('layers').toString().split(',');
      //Remove all displayed layers
      $('#hiddenLayersList').prepend($('#displayedLayersList> li'));

      //Move requested layers into displayed list
      requestedLayers.forEach( function(layer) {
         var moveLayer = $('#'+layer);
         $('#displayedLayersList').append(moveLayer);
      });

      listUpdated();
   }


   //Map dragged then idle listener
   google.maps.event.addListener(map, 'idle', function() {
      google.maps.event.trigger(map, 'resize');       //trigger map to refresh
      adaptiveMapType();                              //trigger map type change if needed
      var idleTimeout = window.setTimeout(            //refresh layers after a defined delay
         function() { 
            refreshLayers();
         }, 
         reloadDelay);   //milliseconds to pause after bounds change

         google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
         window.clearTimeout(idleTimeout);
      });
   });

   //Table click/selection events (for LAISIC debugging)
   handleLocalStorageChange();

   //Latlog indicator for current mouse position
   google.maps.event.addListener(map,'mousemove',function(event) {
      document.getElementById('latlong').innerHTML = 
            Math.round(event.latLng.lat()*10000000)/10000000 + ', ' + Math.round(event.latLng.lng()*10000000)/10000000
   });

   google.maps.event.addListener(map,'click',function(event) {
      console.log(Math.round(event.latLng.lat()*10000000)/10000000 + ', ' + Math.round(event.latLng.lng()*10000000)/10000000);
   });

   google.maps.event.addListenerOnce(map, 'idle', function() {
      //Call all toggle functions on initialize:

      //Initialize vessel age
      vessel_age_changed();

      //Initialize history trail length 
      history_trail_length_changed();

      //Initialize auto refresh rate
      refresh_rate_changed();

      //Check for TMACS layer toggle on load
      toggleTMACSHeadWMSLayer();
      toggleTMACSHistoryWMSLayer();

      //TEST
      testWMSLayers();

      //KML overlay layer
      //toggleKMLLayer();

      //Check for port layers
      //togglePortLayer();

      //Weather
      //toggleWeatherLayer();

      //Heatmap layer
      //toggleHeatmapLayer();

      //toggleQueryAllTracks();

      toggleTrackIcons();

      toggleDistanceTool();

      toggleAutoRefresh();

      toggleNeverAutoRefresh();

      toggleIHSTabs();

      toggleRisk();

      //toggleTimeMachine();

      //toggleCluster();

      enableCustomQuery = false;

      geocoder = new google.maps.Geocoder();

      //toggleEEZLayer();

      reload_delay_changed();

      //toggleDayNightOverlay();

      //initializeBrowserFocus();
   });

   //Keyboard shortcuts/
   //source: http://stackoverflow.com/questions/9195814/google-maps-v3-keyboard-accessibility
   $('body').keydown(function(event) {
      if ($('#accordion').is(':focus')) {
         return;
      }

      if ($('input[type=text], textarea').is(':focus')) {
         return;
      }

      if (event.shiftKey || event.ctrlKey || event.altKey) {
         return;
      }

      var o = 128; // half a tile's width 
      console.log('Pressed key: ' + event.which);

      switch(event.which) {
         case 27: // ESC
            if ($('#setup-alert-modal').dialog("isOpen")) {
               $('#setup-alert-modal').dialog("close");
            }
            break;
         case 32: // spacebar
            //refreshMaps(true);
            //Beta:
            refreshLayers();
            break;
         case 65: // a
            if ($('#autoRefresh:checked').length == 1) {
               //$('input[name=autoRefresh]').attr('checked', false);
               document.getElementById("autoRefresh").checked = false;
               document.getElementById("autoRefresh").removeAttribute("checked");
            }
            else {
               document.getElementById("autoRefresh").checked = true;
            }
            toggleAutoRefresh();
            break;
         case 67: // c
            dataLayers[getdataLayerIndex('AIS-track')].hideLayer();
            dataLayers[getdataLayerIndex('RADAR-track')].hideLayer();
            break;
         case 68: // d
            if ($('#distancetooltoggle:checked').length == 1) {
               document.getElementById("distancetooltoggle").checked = false;
               document.getElementById("distancetooltoggle").removeAttribute("checked");
            }
            else {
               document.getElementById("distancetooltoggle").checked = true;
            }
            toggleDistanceTool();
            break;
         case 69: // e
            if ($('#alertPanel').is(":visible")) {
               $('#setupAlert').trigger( "click" );
            }
            break;
         case 71: // g
            if ($('#enableCluster:checked').length == 1) {
               document.getElementById("enableCluster").checked = false;
               document.getElementById("enableCluster").removeAttribute("checked");
            }
            else {
               document.getElementById("enableCluster").checked = true;
            }
            toggleCluster();
            refreshMaps(true);
            break;
         case 72: // h
            
            break;
         case 73: // i
            if ($('#IHSTabs:checked').length == 1) {
               document.getElementById("IHSTabs").checked = false;
               document.getElementById("IHSTabs").removeAttribute("checked");
            }
            else {
               document.getElementById("IHSTabs").checked = true;
            }
            toggleIHSTabs();
            break;
         case 75: // k
            //Risk information
            if ($('#Risk:checked').length == 1) {
               document.getElementById("Risk").checked = false;
               document.getElementById("Risk").removeAttribute("checked");
            }
            else {
               document.getElementById("Risk").checked = true;
            }
            toggleRisk();
            refreshMaps(true);
            break;
         case 76: // l
            if ($('#LAISIC_TARGETS:checked').length == 1) {
               document.getElementById("LAISIC_TARGETS").checked = false;
               document.getElementById("LAISIC_TARGETS").removeAttribute("checked");
            }
            else {
               document.getElementById("LAISIC_TARGETS").checked = true;

               //Disable other type of views
               //$('input[id=enabletimemachine]').attr('checked', false);
               //toggleTimeMachine();
               disableCustomQuery();
            }
            dataLayers[getdataLayerIndex('AIS-track')].hideLayer();
            dataLayers[getdataLayerIndex('RADAR-track')].hideLayer();
            refreshMaps(true);
            break;
         case 78: // n
            if ($('#showtargetlabels:checked').length > 0) {
               document.getElementById("showtargetlabels").checked = false;
               document.getElementById("showtargetlabels").removeAttribute("checked");
            }
            else {
               document.getElementById("showtargetlabels").checked = true;
            }
            toggleShowTargetLabels();
            break;
         case 80: // p
            //Port layer
            if ($('#displayedLayersList').find('#portsLayer').length == 0) {
               $('#portsLayer').insertAfter('#displayedLayersList li:last');
               listUpdated();
            }
            else {
               $('#portsLayer').insertBefore('#hiddenLayersList li:first');
               listUpdated();
            }  
            break;
         case 82: // r
            location.reload();
            break;
         case 84: // t
            if ($('#displayedLayersList').find('#trafficLayer').length == 0) {
               $('#trafficLayer').insertAfter('#displayedLayersList li:last');
               listUpdated();
            }
            else {
               $('#trafficLayer').insertBefore('#hiddenLayersList li:first');
               listUpdated();
            }
            break;
         case 87: // w
            if ($('#displayedLayersList').find('#weatherLayer').length == 0) {
               $('#weatherLayer').insertAfter('#displayedLayersList li:last');
               listUpdated();
            }
            else {
               $('#weatherLayer').insertBefore('#hiddenLayersList li:first');
               listUpdated();
            }
            break;
         case 37: // leftArrow
            map.panBy(-o,0);
            break;
         case 38: // upArrow
            map.panBy(0,-o);
            break;
         case 39: // rightArrow
            map.panBy(o,0);
            break;
         case 40: // downArrow
            map.panBy(0,o);
            break;
         case 173: // keyboard -
         case 109: // numpad -
         case 189: // -
            map.setZoom(map.getZoom()-1);
            break;
         case 61:  // keyboard + (=)
         case 107: // numpad +
         case 187: // =
            map.setZoom(map.getZoom()+1);
            break;
         case 191: // ?
            //Initialize modal keyboard shortcut dialog box
            $( "#keyboard-shortcut-modal" ).dialog({
               width:  500,
               modal:  true,
               open: function() {
                  $('.ui-widget-overlay').addClass('custom-overlay');
               },
               close: function() {
                  $('.ui-widget-overlay').removeClass('custom-overlay');
               }  
            });
            break;
      }
   });

   /*
   //Need to use 'Q' for query focus on keyup instead of keydown to prevent typing into query after selection
   $('body').keyup(function(event) {
      if ($('#query').is(':focus')) {
         return;
      }

      if ($('#accordion').is(':focus')) {
         return;
      }

      if ($('#geocodeAddress').is(':focus')) {
         return;
      }

      switch(event.which) {
         case 81: // q
            $("#query:text").select()
               .keyup(function (e) {e.preventDefault(); });
            break;
      }
   });

   //Handle ESC while query bar is in focus
   $('body').keyup(function(event) {
      if ($('#query').is(':focus')) {
         switch(event.which) {
            case 27: // ESC
               $("#query:text").blur();
               break;
         }
      }
   });
   */

   //Trigger localStorage to indicate page refresh or new load
   localStorage.clear();
   localStorage.setItem('refresh',1);
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handles refreshing map of all tracks
 */
function refreshTracks() {
   console.log("Calling refreshTracks - (TODO)");

   var trackIDtoRequery = tracksDisplayedID.slice(0);

   //Remove existing track layers
   dataLayers[getdataLayerIndex('AIS-track')].hideLayer();
   dataLayers[getdataLayerIndex('RADAR-track')].hideLayer();

   //TODO: Requery and draw track layers again with new trail length

   /*
   $.each(trackIDtoRequery, function(index, value) {
      console.log('Requerying track for ' + this);
      getTrackByTrackIDandSource(this, "AIS");
      getTrackByTrackIDandSource(this, "RADAR");
   });
   */
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to check if MarineTraffic source image exists.  If not exist, then fill default PNG image
 **/
function checkImageExistOrReplace(url) {
   var img = document.createElement('img');
   img.onload = function() {
      if (document.getElementById('marinetrafficimage')) {
         document.getElementById('marinetrafficimage').src = url;
      }
   }
   img.onerror = function() {
      if (document.getElementById('marinetrafficimage')) {
         document.getElementById('marinetrafficimage').src = 'icons/noimage.png';
      }
   }
   img.src = url;
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to attach information associated with marker, or call track 
 * fetcher to get track line
 */
//function markerInfoBubble(marker, infoBubble, html, mmsi, vesselname, vesseltypeint, streamid, datetime) {
function markerInfoBubble(marker, vessel, infoBubble, layertype) {
   //Prepare vessel image from Marine Traffic
   if (passIMOChecksum(vessel.imo)) {
      imgURL = 'http://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=' + vessel.mmsi + '&imo=' + vessel.imo;
      //imgURL = 'fetch_photo.php?imo=' + vessel.imo;
   }
   else {
      imgURL = 'http://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=' + vessel.mmsi;
   }
   //Check if MarineTraffic image exists; if not, then fill in default PNG image
   checkImageExistOrReplace(imgURL);


   var title, vesseltype;

   if (layertype == 'RADAR') {
      title = 'RADAR Target: ' + vessel.commsid;
      vesseltype = 'RADAR';
   }
   else if (vessel.streamid == 'SAT-SAR') {
      title = 'Sat-SAR Contact ' + vessel.commsid;
      vesseltype = 'SAT-SAR';
   }
   //else if (vessel.commsid != undefined && vessel.streamid == 'shore-radar' || vessel.vesseltypeint == 888 || (vessel.streamid == 'r166710001' && vessel.vesseltypeint != 999)) {
   else if (vessel.trknum !== undefined && vessel.vesseltypeint == 999 && vessel.sourceid == 'shore-radar') {
      title = 'LAISIC Fusion: ' + vessel.trknum + ' (MMSI ' + vessel.mmsi + ')';
      vesseltype = 'LIVE_LAISIC';
   }
   else if (layertype == 'LAISIC' && (vessel.streamid == 'shore-radar' || vessel.vesseltypeint == 888 || (vessel.streamid == 'r166710001' && vessel.vesseltypeint != 999))) {
      title = 'RADAR Trknum: ' + vessel.trknum + ' (' + vessel.mmsi + ')';
      vesseltype = 'LAISIC_RADAR';
   }
   else if (layertype == 'LAISIC' && vessel.vesseltypeint == 999) {
      title = 'LAISIC AIS Trknum: ' + vessel.trknum + ' (' + vessel.mmsi + ')';
      vesseltype = 'LAISIC_AIS_TRACK';
   }
   else if (layertype == 'LAISIC' && vessel.vesseltypeint == 777) {
      title = 'MMSI or RADAR ID: ' + vessel.mmsi;
      vesseltype = 'LAISIC_AIS_OBS';
   }
   else {
      title = vessel.vesselname;
      vesseltype = 'AIS';  //default type
   }


   //Prepare HTML for infoWindow
   if (vesseltype == 'RADAR' || vesseltype == 'SAT-SAR') {
      infoBubble.setContent(generateRadarInfoHTML(vessel, title));
   }
   else if (vesseltype == 'LIVE_LAISIC') {
      infoBubble.setContent(generateLAISICInfoHTML(vessel, vesseltype, title));
   }
   else {
      if (!detectMobileBrowser()) {
         //Default info for AIS bubble
         infoBubble.setContent(generateInfoHTML(vessel, vesseltype, title));
      }
      else {
         //Mobile version of info for AIS bubble
         infoBubble.setContent(generateInfoHTMLmobile(vessel, vesseltype, title));
         infoBubble.setMaxWidth(190);
      }
   }

   //LYNNE's IHS TABS
   if (enableIHSTabs) {
      console.log('imo ' + vessel.imo + " stringlength " + vessel.imo.length);
      if (vessel.imo.length == 7) {
         //Handle adding tabs in the IHS tabs functions
         updateIHSTabTblShip(1,NUM_INFO_BUBBLE,vessel.imo,infoBubble,map,marker,updateIHSTabSigInspect);
      }
      //Add a tab for the regular infoBubble info
      infoBubble.addTab(0);
      infoBubble.updateTab(0,'AIS Based Info',generateInfoHTML(vessel, vesseltype, title));
   }
   //END IHS TABS


   //Open the bubble
   infoBubble.open(map, marker);


   //Update the vessel age timer within the infoBubble/infoWindow
   vesselLastUpdated = setInterval(function () {
      if (Math.floor((new Date().getTime()/1000 - vessel.datetime)/60) > 59) {
         document.getElementById('vesselLastUpdated').innerHTML = Math.floor((new Date().getTime()/1000 - vessel.datetime)/60/60) + " hours, " + Math.floor((new Date().getTime()/1000 - vessel.datetime)/60)%60 + " mins, " + Math.floor(new Date().getTime()/1000 - vessel.datetime )%60 + " secs ago";
      }
      else{
         document.getElementById('vesselLastUpdated').innerHTML = Math.floor((new Date().getTime()/1000 - vessel.datetime)/60) + " mins, " + Math.floor(new Date().getTime()/1000 - vessel.datetime )%60 + " secs ago";
      }
   }, 1000);

   //Add last port calls data if AIS type vessel marker
   if (vesseltype == 'AIS') {   
      google.maps.event.addListenerOnce(infoBubble, "domready", function() {
         setTimeout(function(){ getPortCalls(vessel.mmsi); }, 100);   //tiny delay workaround, wait for infoBubble content to be available, domready for infoBubble has strange behavior, different from infoWindow
      });
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to generate the HTML for infoBubble/infoWindow
 * for a AIS or LAISIC vessel marker.
 */
function generateInfoHTML(vessel, vesseltype, title) {
   var htmlTitle = 
      '<div id="content">'+
      '<span style="vertical-align: middle;display:inline-block;height: 30px;"><img title="' + MIDtoCountry(vessel.mmsi) + '" height=26px align="top" src=flags/' + vessel.mmsi.toString().substr(0,3) + '.png>&nbsp;&nbsp;<span id="firstHeading" class="firstHeading">' + title + '</span></span>' +
      '<div id="bodyContent">';

   var htmlLeft = 
      '<div id="content-left">' +
      '<a href="https://marinetraffic.com/ais/shipdetails.aspx?MMSI=' + vessel.mmsi + '"  target="_blank"> '+
      '<img id="marinetrafficimage" title="Click to open MarineTraffic page" width=180px src="' + imgURL + '" onError="this.onerror=null;this.src="icons/noimage.png";>' + 
      '</a><br>' + 
      '<a href="http://www.sea-web.com/lrupdate.aspx?param1=spatab833&param2=719766&script_name=authenticated/authenticated_handler.aspx&control=list&SearchString=MMSI+=+' + vessel.mmsi + '&ListType=Ships" target="_blank">Sea-Web link</a><br>' + 
      '<div id="content-sub" border=1>' +
      '<b>MMSI</b>: ' + vessel.mmsi + '<br>' +
      '<b>IMO</b>: ' + vessel.imo + (passIMOChecksum(vessel.imo)==true?'':' <font color="red">(invalid)</font>') + '<br>' +
      //'<b>Vessel Type</b>: ' + vesseltype + '<br>' +
      '<b>Vessel Type</b>: ' + vessel.vesseltypeint + '<br>' +
      '<b>Last Message Type</b>: ' + vessel.messagetype + '<br>' +
      '</div>' +
      '<div>' + 
      '<a id="showtracklink" link="" href="javascript:void(0);" onClick="getAISTrack(\'' + vessel.mmsi + '\', \'' + vessel.vesseltypeint + '\');">Show vessel track history</a>' +
      '</div>' +
      (vesseltype=='AIS'?
      '<div id="content-port" border=1>' +
      '<b>Last 3 Port Calls (entry times)</b><br>' +
      '<div id="port_calls">' +
      '<div id="query_spinner"><div style="width: 24px; height: 24px;"></div></div>' + 
      '</div>' + //close for port_calls data div
      '</div>': '') + //close for port_calls div (content-sub)
      '</div>';  //close for content-left div

   var htmlRight = 
      '<div id="content-right">' +
      '<div id="content-sub">' +
      '<b>Report Date</b>: <br>' + toHumanTime(vessel.datetime) + '<br>' +
      //TODO: change local time to be dynamic, not hard coded to Pacific Time zone
      '<b>(local time)</b>: <br>' + toHumanTime(UTCtoSANTime(vessel.datetime)) + '<br>' +
      '<div id="vesselLastUpdated">Last Updated on...</div>' + 
      '<b>Lat</b>: ' + vessel.lat + '<br>' +
      '<b>Lon</b>: ' + vessel.lon + '<br>' +
      '<b>Navigation Status</b>: <br>' + vessel.navstatus + '<br>' +
      '<b>Speed Over Ground</b>: ' + Number(parseFloat(vessel.sog).toFixed(3)) + '<br>' + 
      '<b>Course Over Ground</b>: ' + Number(parseFloat(vessel.cog).toFixed(3)) + '<br>' + 
      '<b>Length x Width</b>: <br>' + vessel.length + ' x ' + vessel.shipwidth + '<br>'+
      '<b>Draught</b>: ' + vessel.draught  + '<br>'+
      '<b>Destination</b>: ' + vessel.destination + '<br>'+
      '<b>ETA</b>: ' + vessel.eta + '<br>'+
      '<b>Source</b>: ' + vessel.streamid + '<br>' +
      '<b>Risk Security</b>: ' + vessel.risk_score_security + '<br>'+	
      '<b>Risk Safety</b>: ' + vessel.risk_score_safety + '<br>'+	
      '</div>' +     //close for content-sub
      '<br><br>' +   
      '<br>' +   
      '</div>' +     //close for content-right
      '</div>' +     //close for bodyContent
      '</div>';      //close for content

   var html = htmlTitle + htmlLeft + htmlRight;
   //END Prepare HTML for infoWindow
   
   return html;
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to generate the HTML for infoBubble/infoWindow
 * for a AIS or LAISIC vessel marker.
 */
function generateInfoHTMLmobile(vessel, vesseltype, title) {
   var htmlTitle = 
      '<div id="content">'+
      '<span style="vertical-align: middle;display:inline-block;height: 30px;"><img title="' + MIDtoCountry(vessel.mmsi) + '" height=26px align="top" src=flags/' + vessel.mmsi.toString().substr(0,3) + '.png>&nbsp;&nbsp;<span id="firstHeading" class="firstHeading">' + title + '</span></span>' +
      '<div id="bodyContent">';

   var htmlLeft = 
      '<div id="content-left">' +
      '<a href="https://marinetraffic.com/ais/shipdetails.aspx?MMSI=' + vessel.mmsi + '"  target="_blank"> '+
      '<img id="marinetrafficimage" title="Click to open MarineTraffic page" width=180px src="' + imgURL + '" onError="this.onerror=null;this.src="icons/noimage.png";>' + 
      '</a><br>' + 
      '<div id="content-sub" border=1>' +
      '<b>MMSI</b>: ' + vessel.mmsi + '<br>' +
      '<b>IMO</b>: ' + vessel.imo + (passIMOChecksum(vessel.imo)==true?'':' <font color="red">(invalid)</font>') + '<br>' +
      //'<b>Vessel Type</b>: ' + vesseltype + '<br>' +
      '<b>Vessel Type</b>: ' + vessel.vesseltypeint + '<br>' +
      '</div>' +
      '<div>' + 
      '<a id="showtracklink" link="" href="javascript:void(0);" onClick="getAISTrack(\'' + vessel.mmsi + '\', \'' + vessel.vesseltypeint + '\');">Show vessel track history</a>' +
      '</div>' +
      '</div>';  //close for content-left div

   var htmlRight = 
      '<div id="content-right">' +
      '<div id="content-sub">' +
      '<b>Report Date</b>: <br>' + toHumanTime(vessel.datetime) + '<br>' +
      '<div id="vesselLastUpdated">Last Updated on...</div>' + 
      '<b>Lat</b>: ' + vessel.lat + '  ' +
      '<b>Lon</b>: ' + vessel.lon + '<br>' +
      '<b>Navigation Status</b>: ' + vessel.navstatus + '<br>' +
      '<b>Speed Over Ground</b>: ' + Number(parseFloat(vessel.sog).toFixed(3)) + '<br>' + 
      '<b>Course Over Ground</b>: ' + Number(parseFloat(vessel.cog).toFixed(3)) + '<br>' + 
      '<b>Length x Width</b>: ' + vessel.length + ' x ' + vessel.shipwidth + '<br>'+
      '</div>' +     //close for content-sub
      '<br><br>' +   
      '<br>' +   
      '</div>' +     //close for content-right
      '</div>' +     //close for bodyContent
      '</div>';      //close for content

   var html = htmlTitle + htmlLeft + htmlRight;
   //END Prepare HTML for infoWindow
   
   return html;
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to generate the HTML for infoBubble/infoWindow
 * for a RADAR vessel marker.
 */
function generateRadarInfoHTML(vessel, title) {
      var htmlTitle = 
      '<div id="content">'+
      '<span style="vertical-align: middle;display:inline-block;height: 30px;"><span id="firstHeading" class="firstHeading"> ' + title + '</span></span>' +
      '<div id="bodyContent">';

   var htmlLeft = 
      '<div id="content-left">' +
      '<div id="content-sub" border=1>' +
      '<b>Track ID</b>: ' + vessel.commsid + '<br>' +
      '<b>Vessel Type</b>: ' + vessel.streamid + '<br>' +
      '<b>Message Type</b>: ' + vessel.opt4val + '<br>' +
      '</div>' +
      '<div>' + 
      '<a id="showtracklink" link="" href="javascript:void(0);" onClick="getRADARTrack(\'' + vessel.commsid + '\');">Show vessel track history</a>' +
      '</div>' +
      '</div>';  //close for content-left div

   var htmlRight = 
      '<div id="content-right">' +
      '<div id="content-sub">' +
      '<b>Report Date</b>: <br>' + toHumanTime(vessel.datetime) + '<br>' +
      //TODO: change local time to be dynamic, not hard coded to Pacific Time zone
      '<b>(local time)</b>: <br>' + toHumanTime(UTCtoSANTime(vessel.datetime)) + '<br>' +
      '<div id="vesselLastUpdated">Last Updated on...</div>' + 
      '<b>Lat</b>: ' + vessel.lat + '<br>' +
      '<b>Lon</b>: ' + vessel.lon + '<br>' +
      '<b>Target Status</b>: ' + vessel.opt1val + '<br>' +
      '<b>Acquisition Type</b>: ' + vessel.opt2val + '<br>' +
      '<b>Speed Over Ground</b>: ' + Number(parseFloat(vessel.sog).toFixed(3)) + '<br>' + 
      '<b>Course Over Ground</b>: ' + Number(parseFloat(vessel.cog).toFixed(3)) + '<br>' + 
      '<b>Heading</b>: ' + Number(parseFloat(vessel.heading).toFixed(3)) + ' degrees<br>' + 
      '<b>Source</b>: ' + vessel.streamid + '<br>' +
      '</div>' +     //close for content-sub
      '<br><br>' +   
      '</div>' +     //close for content-right
      '</div>' +     //close for bodyContent
      '</div>';      //close for content

   var htmlRadar = htmlTitle + htmlLeft + htmlRight;

   return htmlRadar;
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to generate the HTML for infoBubble/infoWindow
 * for a LAISIC live correlated vessel marker.
 */
function generateLAISICInfoHTML(vessel, vesseltype, title) {
   var htmlTitle = 
      '<div id="content">'+
      '<span style="vertical-align: middle;display:inline-block;height: 30px;"><img title="' + MIDtoCountry(vessel.mmsi) + '" height=26px align="top" src=flags/' + vessel.mmsi.toString().substr(0,3) + '.png>&nbsp;&nbsp;<span id="firstHeading" class="firstHeading">' + title + '</span></span>' +
      '<div id="bodyContent">';

   var htmlLeft = 
      '<div id="content-left">' +
      '<a href="https://marinetraffic.com/ais/shipdetails.aspx?MMSI=' + vessel.mmsi + '"  target="_blank"> '+
      '<img id="marinetrafficimage" title="Click to open MarineTraffic page" width=180px src="' + imgURL + '" onError="this.onerror=null;this.src="icons/noimage.png";>' + 
      '</a><br>' + 
      '<a href="http://www.sea-web.com/lrupdate.aspx?param1=%73%70%61%73%74%61%32%35%30&param2=%37%31%34%36%38%37&script_name=authenticated/authenticated_handler.aspx&control=list&SearchString=MMSI+=+' + vessel.mmsi + '&ListType=Ships" target="_blank">Sea-Web link</a><br>' + 
      '<div id="content-sub" border=1>' +
      '<b>RADAR Track ID</b>: ' + vessel.trknum + '<br>' +
      '<b>Associated MMSI</b>: ' + vessel.mmsi + '<br>' +
      '<b>Vessel Type</b>: LAISIC<br>' +
      '</div>' +
      (vesseltype=='AIS'?
      '<div id="content-port" border=1>' +
      '<b>Last 3 Port Calls (entry times)</b><br>' +
      '<div id="port_calls">' +
      '<div id="query_spinner"><div style="width: 24px; height: 24px;"></div></div>' + 
      '</div>' + //close for port_calls data div
      '</div>': '') + //close for port_calls div (content-sub)
      '</div>';  //close for content-left div

   var htmlRight = 
      '<div id="content-right">' +
      '<div id="content-sub">' +
      '<b>Report Date</b>: <br>' + toHumanTime(vessel.datetime) + '<br>' +
      //TODO: change local time to be dynamic, not hard coded to Pacific Time zone
      '<b>(local time)</b>: <br>' + toHumanTime(UTCtoSANTime(vessel.datetime)) + '<br>' +
      '<div id="vesselLastUpdated">Last Updated on...</div>' + 
      '<b>Lat</b>: ' + vessel.lat + '<br>' +
      '<b>Lon</b>: ' + vessel.lon + '<br>' +
      '<b>Speed Over Ground</b>: ' + Number(parseFloat(vessel.sog).toFixed(3)) + '<br>' + 
      '<b>Course Over Ground</b>: ' + Number(parseFloat(vessel.cog).toFixed(3)) + '<br>' + 
      '<b>Source</b>: ' + vessel.sourceid + '<br>' +
      '</div>' +     //close for content-sub
      '<br><br>' +   
      '</div>' +     //close for content-right
      '</div>' +     //close for bodyContent
      '</div>';      //close for content

   var html = htmlTitle + htmlLeft + htmlRight;
   //END Prepare HTML for infoWindow
   
   return html;
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get port calls for a specific MMSI
 */
function getPortCalls(mmsi) {
   console.log("Obtaining port calls for MMSI " + mmsi);

   if ($('#port_calls').length > 0) {
      $('#port_calls').html('<div id="query_spinner"><div style="width: 24px; height: 24px;"></div></div>');
   }

   //Activate the "last 3 port call" spinner
   $('#query_spinner').activity({segments: 8, steps: 3, opacity: 0.3, width: 2, space: 0, length: 5, color: '#000', speed: 2.0});


   var phpWithArg;
   phpWithArg = "query_port_calls.php?mmsi=" + mmsi;

   //Debug query output
   console.log('getPortCalls(): ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         console.log('getPortCalls(): ' + response.query);

         if ($('#port_calls').length > 0) {
            $('#port_calls').html('');
         }

         var i=1;
         $.each(response.port_calls, function(key,port_calls) {
            if (i > 3) {
               return false;
            }

            if ($('#port_calls').length > 0) {
               $('#port_calls').append(toHumanTime(port_calls.time_stamp) + ': <br>' + port_calls.PortName + ', ' + port_calls.Country + '<br>');
            }

            i++;
         });

         console.log('getPortCalls(): ' + "Total number of port calls = " + response.resultcount);
      }) //end .done()
      .fail(function() { 
         console.log('getPortCalls(): ' +  'No response; error in php?'); 
         return; 
      }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
function clearTrack(trackline, trackIcons, dashedLines, trackID, errorEllipses) {
   if (trackline != null && trackIcons != null) {
      trackline.setMap(null);
      trackline = null;
      var trackIcon;
      console.log('Deleting track and ' + trackIcons.length + ' track icons.');
      var dashedLine;
      while (dashedLines.length > 0) {
         dashedLine = dashedLines.pop();
         dashedLine.setMap(null);
      }
      while (trackIcons.length > 0) {
         trackIcon = trackIcons.pop();
         trackIcon.setMap(null);
      }
      while (errorEllipses.length > 0) {
         errorEllipse = errorEllipses.pop();
         errorEllipse.setMap(null);
      }
      if (tracksDisplayed.length == 1) {
         deleteTrackTimeControl();
      }

      //Signal tables to delete history trail table
      localStorage.removeItem('historytrailquery-' + trackID);
      localStorage.removeItem('historytrailtype-' + trackID);
      
      document.getElementById("queryalltracks").checked = false;
      document.getElementById("queryalltracks").removeAttribute("checked");
   }
}

/* -------------------------------------------------------------------------------- */
/*
function clearTrackByTrackID(trackID) {
   if (trackID != null) {
      $.each(tracksDisplayed, function(index) {
         console.debug(index);
         if (this.mmsi == trackID) {
            //console.log('Found track with matching MMSI to delete: ' + trackID);
            clearTrack(this.trackline, this.trackIcons, this.dashedLines, this.mmsi, this.errorEllipses);
            tracksDisplayedID.splice(index, 1);
            tracksDisplayed.splice(index, 1);
         }
         else if (this.trknum == trackID) {
            //console.log('Found track with matching trknum to delete: ' + trackID);
            clearTrack(this.trackline, this.trackIcons, this.dashedLines, this.trknum, this.errorEllipses);
            tracksDisplayedID.splice(index, 1);
            tracksDisplayed.splice(index, 1);
         }
         else {
            console.log('Failure to find trackID to delete: ' + trackID);
         }
      });
   }
   else {
      console.log('Error clearing track by trackID: neither MMSI or trknum is valid');
   }
}
*/

/* -------------------------------------------------------------------------------- */
function toggleQueryAllTracks() {
   if ($('#queryalltracks:checked').length > 0) {
      queryAllTracks();
   }
   else {
      dataLayers[getdataLayerIndex('AIS-track')].hideLayer();
      dataLayers[getdataLayerIndex('RADAR-track')].hideLayer();
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to query and show all tracks within view bounds
 **/
function queryAllTracks() {
   //TODO: reimplement with new layering method
   console.log('queryAllTracks - (TODO)');
}

/* -------------------------------------------------------------------------------- */
function toggleTrackIcons() {
   if ($('#showtrackicons:checked').length > 0) {
      console.log('Showing trackIcons');

      showtrackicons = true;

      //loop through tracksDisplayed
      for (var i=0; i < tracksDisplayed.length; i++) {
         //loop through each trackIcon for an individual vessel's track
         for (var j=0; j < tracksDisplayed[i].trackIcons.length; j++) {
            tracksDisplayed[i].trackIcons[j].setMap(map)
         }
      }
   }
   else {
      console.log('Hiding trackIcons');

      showtrackicons = false;

      //loop through tracksDisplayed
      for (var i=0; i < tracksDisplayed.length; i++) {
         //loop through each trackIcon for an individual vessel's track
         for (var j=0; j < tracksDisplayed[i].trackIcons.length; j++) {
            tracksDisplayed[i].trackIcons[j].setMap(null)
         }
      }
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Called by user clicking "return" key while selected query bar
 **/
function enteredQuery() {
   var entered_query = document.getElementById("query").value;
   console.log(entered_query);

   //Trim white space
   $.trim(entered_query);

   //Create "startsWith" function
   if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
         return this.indexOf(str) == 0;
      };
   }

   //Use startsWith function to find the "SELECT" statement
   //TODO: fix below
   if (entered_query.startsWith('SELECT')) {
      //Set entered query to default to AIS data
      //sourceType = "AIS";
      getTargetsFromDB(map.getBounds(), entered_query, "AIS", true);
   }
   else {
      //Set entered query to default to AIS data
      //sourceType = "AIS";
      getTargetsFromDB(map.getBounds(), entered_query, "AIS", true);
   }
}

/* -------------------------------------------------------------------------------- */
//TODO: update for new layering method
function selectVessel(mmsi) {
   for (var i=0; i < markersDisplayed.length; i++) {
      if (markersDisplayed[i].mmsi == mmsi) {
         new google.maps.event.trigger(markerArray[i], 'click');
      }
   }
}

/* -------------------------------------------------------------------------------- */
function typeSelectUpdated() {
   console.log('Types select updated');

   //Build the global PHP request filter argument string
   //clear the string of old filter
   vesseltypeFilterPHPStr = '';

   //Build new string
   var types = getTypesNotSelected();     //get array of vesseltype integers which are NOT selected

   for (var i=0; i < types.length; i++) {
      vesseltypeFilterPHPStr += '&vthide[]=' + types[i];
   }

   //getAISFromDB() will check vesseltypeFilterPHPStr for filtering
   refreshLayers();
}

/* -------------------------------------------------------------------------------- */
/**
 * Returns an array of integers that matches the vessel types that are NOT checked
 **/
function getTypesNotSelected() {
	var types = [];

   //Check which boxes are still checked
   if(!document.getElementById("All Other Vessels").checked) {
      //Push all types not equal to the ones below; Use the '-1' flag to indicate
      types.push(-1);
   }
   if(!document.getElementById("0-Unspecified Ships").checked) {
      types.push(0);
   }
   if(!document.getElementById("30-Fishing").checked) {
      types.push(30);
   }
   if(!document.getElementById("31-Towing").checked) {
      types.push(31);
   }
   if(!document.getElementById("32-Big Tow").checked) {
      types.push(32);
   }
   if(!document.getElementById("33-Dredge").checked) {
      types.push(33);
   }
   if(!document.getElementById("35-Military").checked) {
      types.push(35);
   }
   if(!document.getElementById("37-Pleasure Craft").checked) {
      types.push(37);
   }
   if(!document.getElementById("50-Pilot").checked) {
      types.push(50);
   }
   if(!document.getElementById("51-Search and Rescue").checked) {
      types.push(51);
   }
   if(!document.getElementById("52-Tug").checked) {
      types.push(52);
   }
   if(!document.getElementById("55-Law Enforcement").checked) {
      types.push(55);
   }
   if(!document.getElementById("6x-Passenger Vessels").checked) {
      types.push(6);   //covers 60-69
   }
   if(!document.getElementById("7x-Cargo Vessels").checked) {
      types.push(7);   //covers 70-79
   }
   if(!document.getElementById("8x-Tankers").checked) {
      types.push(8);   //covers 80-89
   }

   return types;
}

/* -------------------------------------------------------------------------------- */
function getIconColor(vesseltypeint, streamid) {
   var color;
   if (vesseltypeint == 888 || streamid == 'shore-radar' || (streamid == 'r166710001' && vesseltypeint != 999)) {
      //color = '#FE2E2E';
      color = '#F078FF';  //pink
      return color;
   }
         
   if (vesseltypeint >= 70 && vesseltypeint <= 79) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint >= 80 && vesseltypeint <= 89) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint >= 60 && vesseltypeint <= 69) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint == 0) {
      color = '#F78181';
      //return "shipicons/pink0.png";
   }
   else if (vesseltypeint == 55) {
      color = '#0000FF'; 
      //return "shipicons/blue1_90.png";
   }
   else if (vesseltypeint == 35) {
      color = '#0000FF'; 
      //return "shipicons/blue1_90.png";
   }
   else if (vesseltypeint == 31) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 32) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 52) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 33) {
      color = '#DF7401'; 
		//return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 50) {
      color = '#DF7401'; 
		//return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 37) {
      color = '#8904B1'; 
		//return "shipicons/magenta1_90.png";
   }
   else if (vesseltypeint == 30) {
      color = '#01DFD7'; 
		//return "shipicons/cyan1_90.png";
   }
   else if (vesseltypeint == 51) {
      //color = '#FF0000'; 
      color = '#BE3C14'; 
		//return "shipicons/red1_90.png";
   }
   else if (vesseltypeint == 777) { //currently used for LAISIC outputs
      color = '#3333FF'; 
   }
   else if (vesseltypeint == 999) { //currently used for LAISIC outputs
      color = '#FFFF00'; 
      //color = '#A901DB'; 
      //color = '#A4A4A4'; 
		//return "shipicons/lightgray1_90.png";
   }
   else {
      color = '#FFFFFF';
		//return "shipicons/white0.png";
   }
   return color;
}

/* -------------------------------------------------------------------------------- */
function getRiskColor(vesseltypeint, streamid, risk_rating) {
   var color;
   if (streamid == 'shore-radar' || (streamid == 'r166710001' && vesseltypeint != 999)) {
      color = '#F078FF';  //pink
      return color;
   }
   
   if (vesseltypeint == 999) { //currently used for LAISIC outputs
      color = '#A901DB'; 
   }
   else if (risk_rating == "L") { // Green Outline for Vessel
      color = '#00F014';
   }
   else if (risk_rating == "M") { // Yellow Outline for Vessel
      color = '#F0FF78';
   }
   else if (risk_rating == "H" ) { // Red Outline for Vessel
      color = '#FF0014';
   }
   else
   {
      color = '#000000';
   }
   return color;
}

/* -------------------------------------------------------------------------------- */
function toggleHeatmapLayer() {
   if ($('#HeatmapLayer:checked').length != 0) {
      console.log('Adding heatmap layer');
      //markerClusterer.removeMarkers(markerArray);
      addHeatmap();
   }
   else if ($('#HeatmapLayer').length != 0) {
      console.log('Removing heatmap layer');
      if (typeof heatmapLayer != 'undefined' && heatmapLayer != null) {
         heatmapLayer.setMap(null);
         //markerClusterer.addMarkers(markerArray);
         for(var i=0; i < markerArray.length; i++) {
            markerArray[i].setMap(map);
         }
      }
   }
   else {
      //Do nothing, no heatmap div found
   }
}

/* -------------------------------------------------------------------------------- */
//adds an example heat map
//this could be for example a probability of pirate attack map
function addHeatmap() {
   var heatmapData = new Array();

   for(var i=0; i < markerArray.length; i++) {
      heatmapData[i] = markerArray[i].getPosition();
      markerArray[i].setMap(null);
   }

   if (heatmapLayer != null) {
      heatmapLayer.setMap(null);
      heatmapLayer = null;
   }

   heatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData
   });

   heatmapLayer.setMap(map);
}

/* -------------------------------------------------------------------------------- */
function WMSOpenLayersGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
   var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);
   //The user will enter the address to the public WMS layer here.  The data must be in WGS84
   var baseURL = "http://demo.cubewerx.com/cubewerx/cubeserv.cgi?";
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image%2Fjpeg"; //type of image returned  or image/jpeg
   //The layer ID.  Can be found when using the layers properties tool in ArcMap or from the WMS settings 
   var layers = "Foundation.GTOPO30";
   //projection to display. This is the projection of google map. Don't change unless you know what you are doing.  
   //Different from other WMS servers that the projection information is called by crs, instead of srs
   var crs = "EPSG:4326"; 
   //With the 1.3.0 version the coordinates are read in LatLon, as opposed to LonLat in previous versions
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var service = "WMS";
   //the size of the tile, must be 256x256
   var width = "256";
   var height = "256";
   //Some WMS come with named styles.  The user can set to default.
   var styles = "default";
   //Establish the baseURL.  Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.
   var url = baseURL + "Layers=" + layers + "&version=" + version + "&EXCEPTIONS=INIMAGE" + "&Service=" + service + "&request=" + request + "&Styles=" + styles + "&format=" + format + "&CRS=" + crs + "&BBOX=" + bbox + "&width=" + width + "&height=" + height;
   return url;
}

/* -------------------------------------------------------------------------------- */
function testWMSLayers() {
   //Use loadWMS function from wms.js

   //TODO: check if GeoServer is alive

   console.log('GeoServer is alive, get tiles');
   //loadWMS(map, "http://spartan.sd.spawar.navy.mil:8080/geoserver/topp/wms?layers=topp:states&", null);
   //loadWMS(map, "http://spartan.sd.spawar.navy.mil:8080/geoserver/topp/wms?layers=topp:world_shorelines_Project_with_SD_BA&", null);
   //loadWMS(map, "http://spartan.sd.spawar.navy.mil:8080/geoserver/topp/wms?layers=topp:alert_properties&", null);
   //loadWMS(map, "http://spartan.sd.spawar.navy.mil:8080/geoserver/topp/wms?layers=topp:pointlatlon&", null);
   //loadWMS(map, "http://spartan.sd.spawar.navy.mil:8080/geoserver/nurc/wms?layers=nurc:Img_Sample&", null);
}

/* -------------------------------------------------------------------------------- */
function toggleTMACSHeadWMSLayer() {
   var wmsTMACSheadOptions = {
      alt: "TMACS",
      getTileUrl: WMSTMACSHeadGetTileUrl,
      isPng: true,
      maxZoom: 17,
      minZoom: 1,
      name: "TMACS",
      tileSize: new google.maps.Size(WMSTILESIZE, WMSTILESIZE)
   };

   //For interval timer:
   /*
// set interval
var tid = setInterval(mycode, 2000);
function mycode() {
  // do some stuff...
  // no need to recall the function (it's an interval, it'll loop forever)
}
function abortTimer() { // to be called when you want to stop the timer
  clearInterval(tid);
}
    */

   //Track head
   if (document.getElementById("TMACShead") && document.getElementById("TMACShead").checked) {
      //TMACS WMS
      tmacsHeadWMS = new google.maps.ImageMapType(wmsTMACSheadOptions);
      map.overlayMapTypes.insertAt(0, tmacsHeadWMS);
      //map.overlayMapTypes.push(tmacsHeadWMS);
   }
   else {
      map.overlayMapTypes.setAt(0,null);
      //map.overlayMapTypes.removeAt(0);
   }
}

/* -------------------------------------------------------------------------------- */
function toggleTMACSHistoryWMSLayer() {
   var wmsTMACShistoryOptions = {
      alt: "TMACS",
      getTileUrl: WMSTMACSHistoryGetTileUrl,
      isPng: true,
      maxZoom: 17,
      minZoom: 1,
      name: "TMACS",
      tileSize: new google.maps.Size(WMSTILESIZE, WMSTILESIZE)
   };

   //Track history
   if (document.getElementById("TMACShistory") && document.getElementById("TMACShistory").checked) {
      //TMACS WMS
      tmacsHistoryWMS = new google.maps.ImageMapType(wmsTMACShistoryOptions);
      map.overlayMapTypes.insertAt(1, tmacsHistoryWMS);
      //map.overlayMapTypes.push(tmacsHistoryWMS);
   }
   else {
      map.overlayMapTypes.setAt(1,null);
      //map.overlayMapTypes.removeAt(0);
   }
}


/* -------------------------------------------------------------------------------- */
function WMSTMACSHeadGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * WMSTILESIZE / zpow, (tile.y + 1) * WMSTILESIZE / zpow);
   var lr = new google.maps.Point((tile.x + 1) * WMSTILESIZE / zpow, (tile.y) * WMSTILESIZE / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);

   var baseURL = "http://baseWMSurl";  //URL hidden
   var endURL = "&LAYERS=0&STYLES=default&BGCOLOR=0xddddff&EXCEPTIONS=application/vnd.ogc.se_inimage&SYMBOLS=ntds&FONTSIZE=medium&FONTSTYLE=plain&MDP=1067&UPDATESEQUENCE=40&TRANSPARENT=true";
   var crs = "EPSG:4326"; 
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var width = WMSTILESIZE.toString();
   var height = WMSTILESIZE.toString();
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image/png"; //type of image returned  or image/jpeg

   var url = baseURL + "VERSION=" + version + "&REQUEST=" + request + "&CRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&FORMAT=" + format + endURL;

   //console.log(url);
   return url;
}

/* -------------------------------------------------------------------------------- */
function WMSTMACSHistoryGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * WMSTILESIZE / zpow, (tile.y + 1) * WMSTILESIZE / zpow);
   var lr = new google.maps.Point((tile.x + 1) * WMSTILESIZE / zpow, (tile.y) * WMSTILESIZE / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);

   var baseURL = "http://baseWMSurl";  //URL hidden
   var endURL = "&LAYERS=1&STYLES=default&BGCOLOR=0xddddff&EXCEPTIONS=application/vnd.ogc.se_inimage&SYMBOLS=ntds&FONTSIZE=medium&FONTSTYLE=plain&MDP=1067&UPDATESEQUENCE=40&TRANSPARENT=true";
   var crs = "EPSG:4326"; 
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var width = WMSTILESIZE.toString();
   var height = WMSTILESIZE.toString();
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image/png"; //type of image returned  or image/jpeg

   var url = baseURL + "VERSION=" + version + "&REQUEST=" + request + "&CRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&FORMAT=" + format + endURL;
   console.log(url);
   return url;
}

/* -------------------------------------------------------------------------------- */
function vessel_age_changed(refresh) {
   var vessel_age_selection = $("#vessel_age option:selected").val();
   if (vessel_age_selection == "no limit") {
      vessel_age = -1;
   }
   else {
      vessel_age = parseFloat(vessel_age_selection);
   }
   //console.log(vessel_age);
   if (refresh) {
      //refreshMaps(true);
      refreshLayers();
   }
}

/* -------------------------------------------------------------------------------- */
function history_trail_length_changed() {
   var history_trail_length_selection = $("#history_trail_length option:selected").val();
   if (history_trail_length_selection == "no limit") {
      history_trail_length = -1;
   }
   else {
      history_trail_length = parseFloat(history_trail_length_selection);
   }
   console.log('History trail length changed to ', history_trail_length);

   //Update all tracks to reflect new history trail length
   refreshTracks();
}

/* -------------------------------------------------------------------------------- */
function reload_delay_changed() {
   console.log('Reload delay changed');
   reloadDelay = parseInt($("#reload_delay option:selected").text())*1000;
}

/* -------------------------------------------------------------------------------- */
function refresh_rate_changed(refresh) {
   autoRefreshRate = parseFloat($("#refresh_rate option:selected").val())*1000;
   if (isNaN(autoRefreshRate)) {
      autoRefreshRate = 1*60;
   }
   //Need to clear the previous interval (if defined), and set a new one with the new refresh rate
   if (typeof autoRefreshHandler !== 'undefined') {
      autoRefreshOff();
      autoRefreshOn();
   }
   else {
      //auto refresh was off, so keep it off.  Just change the refresh rate (above)
   }

   if (refresh) {
      refreshMaps(true);
      refreshLayers();
   }
}

/* -------------------------------------------------------------------------------- */
function toggleAutoRefresh() {
   if (document.getElementById("autoRefresh") && document.getElementById("autoRefresh").checked) {
      autoRefreshOn();
   }
   else {
      autoRefreshOff();
   }
}

/* -------------------------------------------------------------------------------- */
function autoRefreshOn() {
   console.log('Turning on auto refresh');
   if (typeof autoRefreshHandler === 'undefined') {
      console.log('autoRefreshHandler not defined, creating new interval');
      autoRefreshHandler = setInterval(function(){
            console.log('calling refreshMaps from interval');
            //refreshMaps(true);
            refreshLayers();
         }, autoRefreshRate*60*1);      //millisecs*secs*min
   }
   else {
      console.log('Auto-refresh already set previously with handler: ', autoRefreshHandler);
   }
}

/* -------------------------------------------------------------------------------- */
function autoRefreshOff() {
   console.log('Turning off auto refresh');
   clearInterval(autoRefreshHandler);
   autoRefreshHandler = undefined;
}

/* -------------------------------------------------------------------------------- */
function toggleNeverAutoRefresh() {
   if (document.getElementById("neverRefresh") && document.getElementById("neverRefresh").checked) {
      console.log('Turning off refresh completely');
      autoRefreshOff();
      document.getElementById("refreshoptions").style.opacity = '0.5';

      google.maps.event.clearListeners(map, 'idle');
      google.maps.event.clearListeners(map, 'bounds_changed');
   }
   else {
      console.log('Turning on auto-refresh capabilities');
      autoRefreshOn();
      document.getElementById("refreshoptions").style.opacity = '1.0';

      //Map dragged then idle listener
      google.maps.event.addListener(map, 'idle', function() {
         google.maps.event.trigger(map, 'resize'); 
         var idleTimeout = window.setTimeout(
            function() { 
               //refreshMaps(false);
               //refreshMaps(true);
               refreshLayers();
            }, 
         reloadDelay);   //milliseconds to pause after bounds change

         google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
            window.clearTimeout(idleTimeout);
         });
      });
   }
}

/* -------------------------------------------------------------------------------- */
/** 
* Handle clicking/selection events in LAISIC table
 */
function handleLocalStorageChange() {
   //test localstorage
   function storageEventHandler(e) {
      if (!e) { 
         e = window.event; 
      }
      tableUpdated(e);
   }

   if (window.addEventListener) {
      window.addEventListener("storage", storageEventHandler, false);
   } 
   else {
      window.attachEvent("onstorage", storageEventHandler);
   };
}

/* -------------------------------------------------------------------------------- */
function hideHighlightMMSI() {
   selectionCircle.setMap(null);
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 */
function tableUpdated(selected) {
   key = new String(selected.key);
   value = selected.newValue;

   //console.log("key is: " + key);
   //console.log("value is: " + value);

   hideHighlightMMSI();

   /* TODO: Need to fix below to handle table update
   //Handle AIS vessels
   if (key.indexOf("vessel-") === 0) {
      var mmsi = parseInt(key.substr(7));
      $.grep(vesselArray, function(e, i){ 
         if (e.mmsi == mmsi) {
            //(value == "1") ? markerArray[i].setMap(map) : markerArray[i].setMap(null);
            //(value == "1") ? markersDisplayed[i].vesselnameLabel.setMap(map) : markersDisplayed[i].vesselnameLabel.setMap(null);
            if (value == "1") {
               selectVessel(mmsi);
            }
         }
      });
   }
   */

   //Handle LAISIC_AIS_TRACKS
   if (key.indexOf("laisicaistrack-") === 0) {
      var trknum = parseInt(key.substr(15));
      $.grep(vesselArray, function(e, i){ 
         if (e.trknum == trknum && e.vesseltypeint == 999) {
            console.log('displaying ' + trknum);
            (value == "1") ? markerArray[i].setMap(map) : markerArray[i].setMap(null);
            (value == "1") ? markersDisplayed[i].vesselnameLabel.setMap(map) : markersDisplayed[i].vesselnameLabel.setMap(null);
         }
      });
   }

   //Handle LAISIC_RADAR
   if (key.indexOf("laisicradar-") === 0) {
      var trknum = parseInt(key.substr(12));
      $.grep(vesselArray, function(e, i){ 
         if (e.trknum == trknum && e.vesseltypeint == 888) {
            (value == "1") ? markerArray[i].setMap(map) : markerArray[i].setMap(null);
            (value == "1") ? markersDisplayed[i].vesselnameLabel.setMap(map) : markersDisplayed[i].vesselnameLabel.setMap(null);
         }
      });
   }

   //Handle LAISIC_AIS_OBS
   if (key.indexOf("laisicaisobs-") === 0) {
      var obsguid = key.substr(13);
   //console.log("obsguid is: " + obsguid);
      $.grep(vesselArray, function(e, i){ 
         if (e.obsguid == obsguid && e.vesseltypeint == 777) {
            (value == "1") ? markerArray[i].setMap(map) : markerArray[i].setMap(null);
            (value == "1") ? markersDisplayed[i].vesselnameLabel.setMap(map) : markersDisplayed[i].vesselnameLabel.setMap(null);
         }
      });
   }

   //Handle delete track action
   if (key.indexOf("historytrailquery-") === 0 && (value == '' || value == null)) {
      var trackID = key.substring(18);      
      clearTrackByTrackID(trackID);
   }

   if (key.indexOf("historytrailtype-") === 0) {
      var trackID = key.substring(17);
      var source = value;
      getTrackByTrackIDandSource(trackID, source);
   }
}

/* -------------------------------------------------------------------------------- */
function microtime (get_as_float) {
  // http://kevin.vanzonneveld.net
  // +   original by: Paulo Freitas
  // *     example 1: timeStamp = microtime(true);
  // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
  var now = new Date().getTime() / 1000;
  var s = parseInt(now, 10);

  return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

/* -------------------------------------------------------------------------------- */
function sleep(dur) {
 var d = new Date().getTime() + dur;
  while(new Date().getTime() <= d ) {
    //Do nothing
  }
}

/* -------------------------------------------------------------------------------- */
function toHumanTime(unixtime) {
   var date = new Date(unixtime * 1000);
   var humanTime = date.toLocaleString("en-US",{timeZone: "UTC"});
   return humanTime;
}

/* -------------------------------------------------------------------------------- */
function UTCtoSANTime(unixtime) {
   var localunixtime= parseInt(unixtime)-28800;      //San Diego is 8hrs ahead of UTC currently
   return localunixtime;
}

/* -------------------------------------------------------------------------------- */
function toDate(unixtime) {
   var date = new Date(unixtime * 1000);
   var dateonly = date.getUTCFullYear() + pad(date.getUTCMonth()+1,2) + pad(date.getUTCDate(),2);
   return dateonly;
}

/* -------------------------------------------------------------------------------- */
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

/* -------------------------------------------------------------------------------- */
// Avoid `console` errors in browsers that lack a console, such as IE in non-developer mode
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/* -------------------------------------------------------------------------------- */
// Produce darker shade of provided HTML color code
function shadeColor(color, percent) {   
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

/* -------------------------------------------------------------------------------- */
// Convert MMSI MID to flag image file name
function MIDtoCountry(mmsi) {
   var countryName;
   switch (parseInt(mmsi.toString().substr(0,3))) {
      case 501: countryName = "Adelie Land (French Southern Territories)"; break;
      case 401: countryName = "Afghanistan"; break;
      case 303: countryName = "Alaska (State of)"; break;
      case 201: countryName = "Albania (Republic of)"; break;
      case 605: countryName = "Algeria (People's Democratic Republic of)"; break;
      case 559: countryName = "American Samoa"; break;
      case 202: countryName = "Andorra (Principality of)"; break;
      case 603: countryName = "Angola (Republic of)"; break;
      case 301: countryName = "Anguilla"; break;
      case 304: countryName = "Antigua and Barbuda"; break;
      case 305: countryName = "Antigua and Barbuda"; break;
      case 701: countryName = "Argentine Republic"; break;
      case 216: countryName = "Armenia (Republic of)"; break;
      case 307: countryName = "Aruba"; break;
      case 608: countryName = "Ascension Island"; break;
      case 503: countryName = "Australia"; break;
      case 203: countryName = "Austria"; break;
      case 423: countryName = "Azerbaijani Republic"; break;
      case 204: countryName = "Azores (Portuguese isles of)"; break;
      case 308: countryName = "Bahamas (Commonwealth of the)"; break;
      case 309: countryName = "Bahamas (Commonwealth of the)"; break;
      case 311: countryName = "Bahamas (Commonwealth of the)"; break;
      case 408: countryName = "Bahrain (Kingdom of)"; break;
      case 405: countryName = "Bangladesh (People's Republic of)"; break;
      case 314: countryName = "Barbados"; break;
      case 206: countryName = "Belarus (Republic of)"; break;
      case 205: countryName = "Belgium"; break;
      case 312: countryName = "Belize"; break;
      case 610: countryName = "Benin (Republic of)"; break;
      case 310: countryName = "Bermuda"; break;
      case 410: countryName = "Bhutan (Kingdom of)"; break;
      case 720: countryName = "Bolivia (Republic of)"; break;
      case 478: countryName = "Bosnia and Herzegovina"; break;
      case 611: countryName = "Botswana (Republic of)"; break;
      case 710: countryName = "Brazil (Federative Republic of)"; break;
      case 378: countryName = "British Virgin Islands"; break;
      case 508: countryName = "Brunei Darussalam"; break;
      case 207: countryName = "Bulgaria (Republic of)"; break;
      case 633: countryName = "Burkina Faso"; break;
      case 609: countryName = "Burundi (Republic of)"; break;
      case 514: countryName = "Cambodia (Kingdom of)"; break;
      case 515: countryName = "Cambodia (Kingdom of)"; break;
      case 515: countryName = "Cameroon (Republic of)"; break;
      case 316: countryName = "Canada"; break;
      case 617: countryName = "Cape Verde (Republic of)"; break;
      case 319: countryName = "Cayman Islands"; break;
      case 612: countryName = "Central African Republic"; break;
      case 670: countryName = "Chad (Republic of)"; break;
      case 725: countryName = "Chile"; break;
      case 412: countryName = "China (People's Republic of)"; break;
      case 413: countryName = "China (People's Republic of)"; break;
      case 414: countryName = "China (People's Republic of)"; break;
      case 516: countryName = "Christmas Island (Indian Ocean)"; break;
      case 523: countryName = "Cocos (Keeling) Islands"; break;
      case 730: countryName = "Colombia (Republic of)"; break;
      case 616: countryName = "Comoros (Union of the)"; break;
      case 615: countryName = "Congo (Republic of the)"; break;
      case 518: countryName = "Cook Islands"; break;
      case 321: countryName = "Costa Rica"; break;
      case 619: countryName = "Côte d'Ivoire (Republic of)"; break;
      case 238: countryName = "Croatia (Republic of)"; break;
      case 618: countryName = "Crozet Archipelago"; break;
      case 323: countryName = "Cuba"; break;
      case 209: countryName = "Cyprus (Republic of)"; break;
      case 210: countryName = "Cyprus (Republic of)"; break;
      case 212: countryName = "Cyprus (Republic of)"; break;
      case 270: countryName = "Czech Republic"; break;
      case 445: countryName = "Democratic People's Republic of Korea"; break;
      case 676: countryName = "Democratic Republic of the Congo"; break;
      case 219: countryName = "Denmark"; break;
      case 220: countryName = "Denmark"; break;
      case 621: countryName = "Djibouti (Republic of)"; break;
      case 325: countryName = "Dominica (Commonwealth of)"; break;
      case 327: countryName = "Dominican Republic"; break;
      case 735: countryName = "Ecuador"; break;
      case 622: countryName = "Egypt (Arab Republic of)"; break;
      case 359: countryName = "El Salvador (Republic of)"; break;
      case 631: countryName = "Equatorial Guinea (Republic of)"; break;
      case 625: countryName = "Eritrea"; break;
      case 276: countryName = "Estonia (Republic of)"; break;
      case 624: countryName = "Ethiopia (Federal Democratic Republic of)"; break;
      case 740: countryName = "Falkland Islands (Malvinas)"; break;
      case 231: countryName = "Faroe Islands"; break;
      case 520: countryName = "Fiji (Republic of)"; break;
      case 230: countryName = "Finland"; break;
      case 226: countryName = "France"; break;
      case 227: countryName = "France"; break;
      case 228: countryName = "France"; break;
      case 546: countryName = "French Polynesia"; break;
      case 626: countryName = "Gabonese Republic"; break;
      case 629: countryName = "Gambia (Republic of the)"; break;
      case 213: countryName = "Georgia"; break;
      case 211: countryName = "Germany (Federal Republic of)"; break;
      case 218: countryName = "Germany (Federal Republic of)"; break;
      case 627: countryName = "Ghana"; break;
      case 236: countryName = "Gibraltar"; break;
      case 237: countryName = "Greece"; break;
      case 239: countryName = "Greece"; break;
      case 240: countryName = "Greece"; break;
      case 241: countryName = "Greece"; break;
      case 331: countryName = "Greenland"; break;
      case 330: countryName = "Grenada"; break;
      case 329: countryName = "Guadeloupe (French Department of)"; break;
      case 332: countryName = "Guatemala (Republic of)"; break;
      case 745: countryName = "Guiana (French Department of)"; break;
      case 632: countryName = "Guinea (Republic of)"; break;
      case 630: countryName = "Guinea-Bissau (Republic of)"; break;
      case 750: countryName = "Guyana"; break;
      case 336: countryName = "Haiti (Republic of)"; break;
      case 334: countryName = "Honduras (Republic of)"; break;
      case 477: countryName = "Hong Kong (Special Administrative Region of China)"; break;
      case 243: countryName = "Hungary (Republic of)"; break;
      case 251: countryName = "Iceland"; break;
      case 419: countryName = "India (Republic of)"; break;
      case 525: countryName = "Indonesia (Republic of)"; break;
      case 422: countryName = "Iran (Islamic Republic of)"; break;
      case 425: countryName = "Iraq (Republic of)"; break;
      case 250: countryName = "Ireland"; break;
      case 428: countryName = "Israel (State of)"; break;
      case 247: countryName = "Italy"; break;
      case 339: countryName = "Jamaica"; break;
      case 431: countryName = "Japan"; break;
      case 432: countryName = "Japan"; break;
      case 438: countryName = "Jordan (Hashemite Kingdom of)"; break;
      case 436: countryName = "Kazakhstan (Republic of)"; break;
      case 634: countryName = "Kenya (Republic of)"; break;
      case 635: countryName = "Kerguelen Islands"; break;
      case 529: countryName = "Kiribati (Republic of)"; break;
      case 440: countryName = "Korea (Republic of)"; break;
      case 441: countryName = "Korea (Republic of)"; break;
      case 447: countryName = "Kuwait (State of)"; break;
      case 451: countryName = "Kyrgyzstan"; break;
      case 531: countryName = "Laos"; break;
      case 531: countryName = "Lao People's Democratic Republic"; break;
      case 275: countryName = "Latvia (Republic of)"; break;
      case 450: countryName = "Lebanon"; break;
      case 644: countryName = "Lesotho (Kingdom of)"; break;
      case 636: countryName = "Liberia (Republic of)"; break;
      case 637: countryName = "Liberia (Republic of)"; break;
      case 252: countryName = "Liechtenstein (Principality of)"; break;
      case 277: countryName = "Lithuania (Republic of)"; break;
      case 253: countryName = "Luxembourg"; break;
      case 453: countryName = "Macao"; break;
      case 274: countryName = "Macedonia (Republic of)"; break;
      case 647: countryName = "Madagascar (Republic of)"; break;
      case 255: countryName = "Madeira (Portuguese isles of)"; break;
      case 655: countryName = "Malawi"; break;
      case 533: countryName = "Malaysia"; break;
      case 455: countryName = "Maldives (Republic of)"; break;
      case 649: countryName = "Mali (Republic of)"; break;
      case 215: countryName = "Malta"; break;
      case 229: countryName = "Malta"; break;
      case 248: countryName = "Malta"; break;
      case 249: countryName = "Malta"; break;
      case 256: countryName = "Malta"; break;
      case 538: countryName = "Marshall Islands (Republic of the)"; break;
      case 347: countryName = "Martinique (French Department of)"; break;
      case 654: countryName = "Mauritania (Islamic Republic of)"; break;
      case 645: countryName = "Mauritius (Republic of)"; break;
      case 345: countryName = "Mexico"; break;
      case 510: countryName = "Micronesia (Federated States of)"; break;
      case 214: countryName = "Moldova (Republic of)"; break;
      case 254: countryName = "Monaco (Principality of)"; break;
      case 457: countryName = "Mongolia"; break;
      case 457: countryName = "Montenegro (Republic of)"; break;
      case 348: countryName = "Montserrat"; break;
      case 242: countryName = "Morocco (Kingdom of)"; break;
      case 650: countryName = "Mozambique (Republic of)"; break;
      case 506: countryName = "Myanmar (Union of)"; break;
      case 659: countryName = "Namibia (Republic of)"; break;
      case 544: countryName = "Nauru (Republic of)"; break;
      case 459: countryName = "Nepal"; break;
      case 244: countryName = "Netherlands (Kingdom of the)"; break;
      case 245: countryName = "Netherlands (Kingdom of the)"; break;
      case 246: countryName = "Netherlands (Kingdom of the)"; break;
      case 306: countryName = "Netherlands Antilles"; break;
      case 540: countryName = "New Caledonia"; break;
      case 512: countryName = "New Zealand"; break;
      case 350: countryName = "Nicaragua"; break;
      case 656: countryName = "Niger (Republic of the)"; break;
      case 657: countryName = "Nigeria (Federal Republic of)"; break;
      case 542: countryName = "Niue"; break;
      case 536: countryName = "Northern Mariana Islands (Commonwealth of the)"; break;
      case 257: countryName = "Norway"; break;
      case 258: countryName = "Norway"; break;
      case 259: countryName = "Norway"; break;
      case 461: countryName = "Oman (Sultanate of)"; break;
      case 463: countryName = "Pakistan (Islamic Republic of)"; break;
      case 511: countryName = "Palau (Republic of)"; break;
      case 443: countryName = "Palestinian Authority (based on Resolution 99 of PP-98)"; break;
      case 351: countryName = "Panama (Republic of)"; break;
      case 352: countryName = "Panama (Republic of)"; break;
      case 353: countryName = "Panama (Republic of)"; break;
      case 354: countryName = "Panama (Republic of)"; break;
      case 355: countryName = "Panama (Republic of)"; break;
      case 356: countryName = "Panama (Republic of)"; break;
      case 357: countryName = "Panama (Republic of)"; break;
      case 370: countryName = "Panama (Republic of)"; break;
      case 371: countryName = "Panama (Republic of)"; break;
      case 372: countryName = "Panama (Republic of)"; break;
      case 373: countryName = "Panama (Republic of)"; break;
      case 553: countryName = "Papua New Guinea"; break;
      case 755: countryName = "Paraguay (Republic of)"; break;
      case 760: countryName = "Peru"; break;
      case 548: countryName = "Philippines (Republic of the)"; break;
      case 555: countryName = "Pitcairn Island"; break;
      case 261: countryName = "Poland (Republic of)"; break;
      case 263: countryName = "Portugal"; break;
      case 358: countryName = "Puerto Rico"; break;
      case 466: countryName = "Qatar (State of)"; break;
      case 660: countryName = "Réunion (French Department of)"; break;
      case 264: countryName = "Romania"; break;
      case 273: countryName = "Russian Federation"; break;
      case 661: countryName = "Rwandese Republic"; break;
      case 665: countryName = "Saint Helena"; break;
      case 341: countryName = "Saint Kitts and Nevis"; break;
      case 343: countryName = "Saint Lucia"; break;
      case 607: countryName = "Saint Paul and Amsterdam Islands"; break;
      case 361: countryName = "Saint Pierre and Miquelon (Territorial Collectivity of)"; break;
      case 375: countryName = "Saint Vincent and the Grenadines"; break;
      case 376: countryName = "Saint Vincent and the Grenadines"; break;
      case 377: countryName = "Saint Vincent and the Grenadines"; break;
      case 561: countryName = "Samoa (Independent State of)"; break;
      case 268: countryName = "San Marino (Republic of)"; break;
      case 668: countryName = "São Tomé and Príncipe (Democratic Republic of)"; break;
      case 403: countryName = "Saudi Arabia (Kingdom of)"; break;
      case 663: countryName = "Senegal (Republic of)"; break;
      case 279: countryName = "Serbia"; break;
      case 664: countryName = "Seychelles (Republic of)"; break;
      case 667: countryName = "Sierra Leone"; break;
      case 563: countryName = "Singapore (Republic of)"; break;
      case 564: countryName = "Singapore (Republic of)"; break;
      case 565: countryName = "Singapore (Republic of)"; break;
      case 566: countryName = "Singapore (Republic of)"; break;
      case 267: countryName = "Slovakia"; break;
      case 278: countryName = "Slovenia (Republic of)"; break;
      case 642: countryName = "Socialist People's Libyan Arab Jamahiriya"; break;
      case 557: countryName = "Solomon Islands"; break;
      case 666: countryName = "Somali Democratic Republic"; break;
      case 601: countryName = "South Africa (Republic of)"; break;
      case 224: countryName = "Spain"; break;
      case 225: countryName = "Spain"; break;
      case 417: countryName = "Sri Lanka (Democratic Socialist Republic of)"; break;
      case 662: countryName = "Sudan (Republic of the)"; break;
      case 765: countryName = "Suriname (Republic of)"; break;
      case 669: countryName = "Swaziland (Kingdom of)"; break;
      case 265: countryName = "Sweden"; break;
      case 266: countryName = "Sweden"; break;
      case 269: countryName = "Switzerland (Confederation of)"; break;
      case 468: countryName = "Syrian Arab Republic"; break;
      case 416: countryName = "Taiwan (Republic of China)"; break;
      case 674: countryName = "Tanzania (United Republic of)"; break;
      case 677: countryName = "Tanzania (United Republic of)"; break;
      case 567: countryName = "Thailand"; break;
      case 671: countryName = "Togolese Republic"; break;
      case 570: countryName = "Tonga (Kingdom of)"; break;
      case 362: countryName = "Trinidad and Tobago"; break;
      case 672: countryName = "Tunisia"; break;
      case 271: countryName = "Turkey"; break;
      case 434: countryName = "Turkmenistan"; break;
      case 364: countryName = "Turks and Caicos Islands"; break;
      case 572: countryName = "Tuvalu"; break;
      case 675: countryName = "Uganda (Republic of)"; break;
      case 272: countryName = "Ukraine"; break;
      case 470: countryName = "United Arab Emirates"; break;
      case 232: countryName = "United Kingdom of Great Britain and Northern Ireland"; break;
      case 233: countryName = "United Kingdom of Great Britain and Northern Ireland"; break;
      case 234: countryName = "United Kingdom of Great Britain and Northern Ireland"; break;
      case 235: countryName = "United Kingdom of Great Britain and Northern Ireland"; break;
      case 379: countryName = "United States Virgin Islands"; break;
      case 338: countryName = "United States of America"; break;
      case 366: countryName = "United States of America"; break;
      case 367: countryName = "United States of America"; break;
      case 368: countryName = "United States of America"; break;
      case 369: countryName = "United States of America"; break;
      case 770: countryName = "Uruguay (Eastern Republic of)"; break;
      case 437: countryName = "Uzbekistan"; break;
      case 576: countryName = "Vanuatu (Republic of)"; break;
      case 577: countryName = "Vanuatu (Republic of)"; break;
      case 208: countryName = "Vatican City State"; break;
      case 775: countryName = "Venezuela (Bolivarian Republic of)"; break;
      case 574: countryName = "Vietnam (Socialist Republic of)"; break;
      case 578: countryName = "Wallis and Futuna Islands"; break;
      case 473: countryName = "Yemen (Republic of)"; break;
      case 475: countryName = "Yemen (Republic of)"; break;
      case 678: countryName = "Zambia (Republic of)"; break;
      case 679: countryName = "Zimbabwe (Republic of)"; break;
      default: countryName = "";
   }
   return countryName;
}

/* -------------------------------------------------------------------------------- */
function toggleIHSTabs() {
   if (document.getElementById("IHSTabs") && document.getElementById("IHSTabs").checked) {
      console.log("Turning on IHS tabs");
      enableIHSTabs = true;
   }
   else {
      console.log("Turning off IHS tabs");
      enableIHSTabs = false;
   }
}

/* -------------------------------------------------------------------------------- */
function toggleRisk() {
   if (document.getElementById("Risk") && document.getElementById("Risk").checked) {
      console.log("Turning on risk information");
      enableRisk = true;
   }
   else {
      console.log("Turning off risk information");
      enableRisk = false;
   }
}

/* -------------------------------------------------------------------------------- */
function toggleCluster(refresh) {
   if (document.getElementById("enableCluster") && document.getElementById("enableCluster").checked) {
      console.log("Turning on clusters");
      enableCluster = true;
   }
   else {
      console.log("Turning off clusters");
      enableCluster = false;
   }
   if (refresh) {
      refreshLayers();
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Time Machine tool, function called from index.html
 **/
/*
function TimeMachineLookup(timestart, timeend) {
   //Turn on Time Machine feature
   //document.getElementById("enabletimemachine").checked = true;
   $('input[id=enabletimemachine]').attr('checked', true);
   //toggleTimeMachine();

   startTimeMachine = timestart;
   endTimeMachine = timeend;

   queryTimeMachine = 'SELECT  A.`MMSI`, A.`CommsID`, A.`IMONumber`, A.`CallSign`, A.`Name`, A.`VesType`, A.`Cargo`, A.`AISClass`, A.`Length`, A.`Beam`, A.`Draft`, A.`AntOffsetBow`, A.`AntOffsetPort`, B.`TimeOfFix`, B.`Latitude`, B.`Longitude`, B.`SOG`, B.`Heading`, B.`RxStnID` FROM vessels_memory A INNER JOIN (SELECT vm1.`MMSI`, vm1.`TimeOfFix`, vm1.`Latitude`, vm1.`Longitude`, vm1.`SOG`, vm1.`Heading`, vm1.`RxStnID` FROM vessel_history vm1 INNER JOIN (SELECT mmsi, max(TimeOfFix) as maxtime, Latitude, Longitude AS TimeOfFix FROM vessel_history WHERE TimeOfFix BETWEEN ' + timestart + ' and ' + timeend;


   //Custom filtering for a specific MMSI
   filterMMSITimeMachine = document.getElementById("filterMMSITimeMachine").value;
   if (!isNaN(parseInt(filterMMSITimeMachine))) {
      filterMMSI = parseInt(filterMMSITimeMachine);
      queryTimeMachine += " AND MMSI = " + filterMMSI;
   }
   else {
      document.getElementById("filterMMSITimeMachine").value = 'Please enter a MMSI';
   }
   
   customQueryTimeMachine = document.getElementById("customQueryTimeMachine").value;
   if (customQueryTimeMachine != '' && customQueryTimeMachine != "i.e. 'SOG < 1'") {
      queryTimeMachine += " AND " + customQueryTimeMachine;
   }

   console.debug(queryTimeMachine);

   //Use custom query feature to execute Time Machine
   getTargetsFromDB(map.getBounds(), queryTimeMachine, 'AIS', true);
}
*/

/* -------------------------------------------------------------------------------- */
/*
function toggleTimeMachine() {
   if (document.getElementById("enabletimemachine") && document.getElementById("enabletimemachine").checked) {
      console.log("Turning on Time Machine");
      enableTimeMachine = true;

      //Turn off autorefresh when using Time Machine
      $('input[name=autoRefresh]').attr('checked', false);
      toggleAutoRefresh();

      document.getElementById('status-msg').innerHTML = "TIME MACHINE CURRENTLY TURNED ON";
      document.getElementById('status-msg').style.opacity = "1";
   }
   else {
      console.log("Turning off Time Machine");
      enableTimeMachine = false;

      timestart = null;
      timeend = null;

      document.getElementById('status-msg').style.opacity = "0";
   }
}
*/

/* -------------------------------------------------------------------------------- */
function detectMobileBrowser() {
   var check = false;

   (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
   
   return check; 
}



/* -------------------------------------------------------------------------------- */
/**
 *
 **/
function disableCustomQuery() {
   enableCustomQuery = false;
   queryCustomQuery = null;
   document.getElementById('status-msg').style.opacity = "0";
   
   refreshMaps(true);
}

/* -------------------------------------------------------------------------------- */
/**
 *
 **/
function passIMOChecksum(imo) {
   if (imo == null) {
      return false;
   }

   if (imo.length != 7) {
      return false;
   }

   //Compute checksum
   var cs = imo[0]*7 + imo[1]*6 + imo[2]*5 + imo[3]*4 + imo[4]*3 + imo[5]*2;
   cs = cs % 10;
   if (cs != imo[6]) {
      return false;
   }

   return true;
}

/* -------------------------------------------------------------------------------- */
/**
 * Function returns a vessel object from vesselArray that matches given MMSI
 **/
function fetchVesselArray(mmsiToSearch) {
   for (var i=0; i < vesselArray.length; i++) {
      if (vesselArray[i].mmsi == parseInt(mmsiToSearch)) {
         return vesselArray[i];
      }
   }
   return null;
}

/* -------------------------------------------------------------------------------- */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}




/* -------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------------- */

//Global Objects and definitions
var dataLayers = [];                //array of dataLayerObject, each layer to be displayed on map
var globalResultCount;

function dataLayerObject(id, showFunction, hideFunction, updateIfShown) {       //dataLayerObject prototype
   this.layerID = id;
   this.showLayer = function() {       //wrap showFunction with spinner handler
      console.log('Showing ' + this.layerID);

      //Start the spinner for individual layers
      var spinner = $('#'+this.layerID).find('.spinner');

      //Remove warning glyphicon in case it was appended in the last call
      spinner.empty();

      if (typeof spinner !== 'undefined') {
         spinner.activity({
            segments: 8, 
            steps: 3, 
            opacity: 0.5, 
            width: 4, 
            space: 0, 
            length: 4, 
            color: '#3C763D', 
            speed: 3.0,
         }); //show spinner

         spinner.addClass('spinning');

         showBusyIndicator();                   //show global spinner
      }

      //Call individuals layer's show function
      showFunction(this,                  //need to pass this dataLayerObject into the show function
            //Function to be called after layer displaying is processed
            // result is true if successful displaying, false if error (i.e. error in query)
            function callback(result) {    //callback function to stop the spinner
               //Stop the progress indicator for this layer
               if (typeof spinner !== 'undefined') {
                  $('#'+id).find('.spinner').activity(false);
                  spinner.removeClass('spinning');

                  if ($('.spinning').length == 0) {
                     hideBusyIndicator();       //hide global spinner
                  }
               }

               //If error on show function, display warning indicator
               if (typeof result !== 'undefined' && !result) {
                  $('#'+id).find('.spinner').append('<span class="glyphicon glyphicon-warning-sign"></span>');
               }
            });
   };      

   this.hideLayer = hideFunction;      //hide function
   this.updateLayer = this.showLayer;  //just point to the show function
   this.updateIfShown = updateIfShown;
   //this.data; //optional, will depend on data type.  Good to use for simple layers.
};

/* -------------------------------------------------------------------------------- */
/** 
 * Loops through each property of thislayer.data and remove array elements from map
 * and also clears the array.
 **/
function clearLayerMarkers(thislayer) {
   //Robust method
   for (var property in thislayer.data) {
      if (thislayer.data.hasOwnProperty(property)) {
         //Remove from map if array elements have defined setMap() function
         thislayer.data[property].forEach( function (marker) {
            if (typeof marker.setMap !== 'undefined') {
               marker.setMap(null);
               google.maps.event.clearInstanceListeners(marker);
            }
         });
         emptyArray(thislayer.data[property]);
      }
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Loops through each property of thislayer.data and remove array elements from map
 * and also clears the array.
 **/
function clearMarkersAndEmptyArrays(data) {
   //Robust method
   for (var property in data) {
      if (data.hasOwnProperty(property)) {
         //Remove from map if array elements have defined setMap() function
         if (typeof data[property].forEach !== 'undefined') {
            data[property].forEach( function (marker) {
               if (typeof marker.setMap !== 'undefined') {
                  marker.setMap(null);
                  google.maps.event.clearInstanceListeners(marker);
               }
            });
            emptyArray(data[property]);
         }

         if (typeof data[property].setMap !== 'undefined') {
            data[property].setMap(null);
            google.maps.event.clearInstanceListeners(data[property]);
         }
      }
   }
}


/* -------------------------------------------------------------------------------- */
/**
 * Initialize the layers on start up
 **/
$(function initializeLayers() {
   //--------------------------------------------------------------
   //AIS layer
   var aisLayer = new dataLayerObject('aisLayer', 
      function showaisLayer(thislayer, callback) {
         //console.log('Displaying AIS layer');
         
         //Cluster view
         if ($('#enableCluster:checked').length != 0 && map.getZoom() < 9 && isSearchMode()) {
            getClustersFromDB(thislayer, callback);            
         }
         //Individual vessel view
         else {
            getAISFromDB(thislayer, callback);
         }
      }, 
      function hideaisLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   aisLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   aisLayer.dataType = 'AIS';
   aisLayer.markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
   aisLayer.phpfile = 'query_current_vessels.php';
   aisLayer.resultCount = 0;
   aisLayer.lastestCall = null;
   dataLayers.push(aisLayer);

   //--------------------------------------------------------------
   //AIS Track layer
   var aisTrackLayer = new dataLayerObject('aisLayer', 
      function showaisTrackLayer(thislayer, callback) {
         //This layer does not execute any displaying at all.
         //It is called within the getAISFromDB() function when users trigger it
         callback();
      }, 
      function hideaisTrackLayer() {
         deleteAISTracks(this);
      },
      false  //don't force refresh this layer
      );
   //Data object of arrays
   aisTrackLayer.data = {
      MMSIArray: [],          //array of MMSI that are currently displayed
      trackDataArray: []          //array of track data and markers
   };
   aisTrackLayer.dataType = 'AIS-track';
   aisTrackLayer.source = 'AIS';
   aisTrackLayer.phpfile = 'query_track.php';
   aisTrackLayer.tracklineIconsOptions = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FFFFFF',
               fillColor:     '#FFFFFF',
               fillOpacity:   1
            };
   //Delete track function
   aisTrackLayer.deleteTrack = function (mmsi) {
      var index = this.data.MMSIArray.indexOf(mmsi);
      this.data.MMSIArray.splice(index, 1);
      clearMarkersAndEmptyArrays(this.data.trackDataArray[index]);
      this.data.trackDataArray.splice(index, 1);
   }
   dataLayers.push(aisTrackLayer);

   //--------------------------------------------------------------
   //LAISIC LIVE layer
   var laisicLiveLayer = new dataLayerObject('livelaisicLayer', 
      function showLaisicLayer(thislayer, callback) {
         getLAISICFromDB('LIVE_LAISIC', thislayer, callback);
      }, 
      function hideLaisicLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   laisicLiveLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   laisicLiveLayer.dataType = 'LIVE_LAISIC';
   laisicLiveLayer.markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
   laisicLiveLayer.phpfile = 'query_current_vessels.php';
   laisicLiveLayer.resultCount = 0;
   laisicLiveLayer.lastestCall = null;
   dataLayers.push(laisicLiveLayer);

   //--------------------------------------------------------------
   //LAISIC AIS Track layer
   var laisicAisTrackLayer = new dataLayerObject('laisicLayer', 
      function showLaisicLayer(thislayer, callback) {
         getLAISICFromDB('LAISIC_AIS_TRACK', thislayer, callback);
      }, 
      function hideLaisicLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   laisicAisTrackLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   laisicAisTrackLayer.dataType = 'LAISIC_AIS_TRACK';
   laisicAisTrackLayer.markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
   laisicAisTrackLayer.phpfile = 'query_current_vessels.php';
   laisicAisTrackLayer.resultCount = 0;
   laisicAisTrackLayer.lastestCall = null;
   dataLayers.push(laisicAisTrackLayer);

   //--------------------------------------------------------------
   //LAISIC RADAR layer
   var laisicRadarLayer = new dataLayerObject('laisicLayer', 
      function showLaisicLayer(thislayer, callback) {
         getLAISICFromDB('LAISIC_RADAR', thislayer, callback);
      }, 
      function hideLaisicLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   laisicRadarLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   laisicRadarLayer.dataType = 'LAISIC_RADAR';
   laisicRadarLayer.markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
   laisicRadarLayer.phpfile = 'query_current_vessels.php';
   laisicRadarLayer.resultCount = 0;
   laisicRadarLayer.lastestCall = null;
   dataLayers.push(laisicRadarLayer);

   //--------------------------------------------------------------
   //LAISIC AIS Observation layer
   var laisicAisObservationLayer = new dataLayerObject('laisicLayer', 
      function showLaisicLayer(thislayer, callback) {
         getLAISICFromDB('LAISIC_AIS_OBS', thislayer, callback);
      }, 
      function hideLaisicLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   laisicAisObservationLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   laisicAisObservationLayer.dataType = 'LAISIC_AIS_OBS';
   laisicAisObservationLayer.markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
   laisicAisObservationLayer.phpfile = 'query_current_vessels.php';
   laisicAisObservationLayer.resultCount = 0;
   laisicAisObservationLayer.lastestCall = null;
   dataLayers.push(laisicAisObservationLayer);

   //--------------------------------------------------------------
   //RADAR layer
   var radarLayer = new dataLayerObject('radarLayer', 
      function showradarLayer(thislayer, callback) {
         //console.log('Displaying RADAR layer');
         getRADARFromDB(null, thislayer, callback);  //parameters: (customQuery, callback when done)
      }, 
      function hideradarLayer() {
         //console.log('hiding RADAR layer');
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   radarLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   radarLayer.dataType = 'RADAR';
   //Marker path definition for this layer: Circle with line for direction (intended for RADAR)
   //TODO: incorporate marker size with vw or vl
   //radarLayer.markerpath = 'M 0, 0 m -6, 0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 m 8 0 l 10 0';
   //radarLayer.markerpath = 'M 10, 0 l -13,-7 l -5,2 l -2,5 l 2,4 l 5,2 l 12,-6 l 1,0 Z';
   radarLayer.markerpath = 'M 0,-9 6,2 4,6 0,8 -4,6 -6,2 Z';
   radarLayer.markercolor = '#FF0000';
   radarLayer.strokecolor = '#000000';
   radarLayer.phpfile = 'query_current_vessels.php';
   radarLayer.resultCount = 0;
   dataLayers.push(radarLayer);

   //--------------------------------------------------------------
   //RADAR Track layer
   var radarTrackLayer = new dataLayerObject('radarLayer', 
      function showradarTrackLayer(thislayer, callback) {
         //This layer does not execute any displaying at all.
         //It is called within the getRADARFromDB() function when users trigger it
         callback();
      }, 
      function hideradarTrackLayer() {
         deleteRADARTracks(this);
      },
      false  //don't force refresh this layer
      );
   //Data object of arrays
   radarTrackLayer.data = {
      CommsIDArray: [],          //array of RADAR IDs that are currently displayed
      trackDataArray: []          //array of track data and markers
   };
   radarTrackLayer.dataType = 'RADAR-track';
   radarTrackLayer.source = 'RADAR';
   radarTrackLayer.phpfile = 'query_track.php';
   radarTrackLayer.tracklineIconsOptions = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FF0000',
               fillColor:     '#FF0000',
               fillOpacity:   1
            };
   //Delete track function
   radarTrackLayer.deleteTrack = function (commsid) {
      var index = this.data.CommsIDArray.indexOf(commsid);
      this.data.CommsIDArray.splice(index, 1);
      console.log('index is ', index);
      clearMarkersAndEmptyArrays(this.data.trackDataArray[index]);
      this.data.trackDataArray.splice(index, 1);
   }
   dataLayers.push(radarTrackLayer);

   //--------------------------------------------------------------
   //SAT-SAR layer
   var satsarLayer = new dataLayerObject('satsarLayer', 
      function showradarLayer(thislayer, callback) {
         //console.log('Displaying RADAR layer');
         getRADARFromDB(null, thislayer, callback);  //parameters: (customQuery, callback when done)

         //TODO: grab SAT-SAR corners
      }, 
      function hideradarLayer() {
         //console.log('hiding RADAR layer');
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   satsarLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   satsarLayer.dataType = 'SAT-SAR';
   //Marker path definition for this layer: Circle with line for direction (intended for RADAR)
   //TODO: incorporate marker size with vw or vl
   //satsarLayer.markerpath = 'M 0, 0 m -6, 0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 m 8 0 l 10 0';
   //satsarLayer.markerpath = 'M 10, 0 l -13,-7 l -5,2 l -2,5 l 2,4 l 5,2 l 12,-6 l 1,0 Z';
   satsarLayer.markerpath = 'M 0,-9 6,2 4,6 0,8 -4,6 -6,2 Z';
   satsarLayer.markercolor = '#010101';
   satsarLayer.strokecolor = '#FF0000';
   satsarLayer.phpfile = 'query_current_vessels.php';
   satsarLayer.resultCount = 0;
   dataLayers.push(satsarLayer);

   //--------------------------------------------------------------
   //SAT-EO layer
   var sateoLayer = new dataLayerObject('sateoLayer', 
      function showradarLayer(thislayer, callback) {
         //console.log('Displaying RADAR layer');
         getRADARFromDB(null, thislayer, callback);  //parameters: (customQuery, callback when done)
      }, 
      function hideradarLayer() {
         //console.log('hiding RADAR layer');
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );
   //Data object of arrays
   sateoLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   sateoLayer.dataType = 'SAT-EO';
   //Marker path definition for this layer: Circle with line for direction (intended for RADAR)
   //TODO: incorporate marker size with vw or vl
   //sateoLayer.markerpath = 'M 0, 0 m -6, 0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0 m 8 0 l 10 0';
   //sateoLayer.markerpath = 'M 10, 0 l -13,-7 l -5,2 l -2,5 l 2,4 l 5,2 l 12,-6 l 1,0 Z';
   sateoLayer.markerpath = 'M 0,-9 6,2 4,6 0,8 -4,6 -6,2 Z';
   sateoLayer.markercolor = '#010101';
   sateoLayer.strokecolor = '#FF0000';
   sateoLayer.phpfile = 'query_current_vessels.php';
   sateoLayer.resultCount = 0;
   dataLayers.push(sateoLayer);

   //--------------------------------------------------------------
   //KMZ layer
   var kmzLayer = new dataLayerObject('kmzLayer', 
      function showkmzLayer(thislayer, callback) {
         thislayer.data.docs.forEach(function (doc) {
            thislayer.data.showDocument(doc);
         });

         callback();
      }, 
      function hidekmzLayer() {
         //console.log('Hiding KMZ layer');
         var parser = this.data;
         parser.docs.forEach(function (doc) {
            parser.hideDocument(doc);
         });
      },
      false  //force refresh this layer
      );
   //Define the day night layer object, append to a dataLayer to dataLayerObject
   kmzLayer.dataType = 'KMZ';
   kmzLayer.data = new geoXML3.parser({
      map: null,
      processStyles: true,
      singleInfoWindow: true
   });
   dataLayers.push(kmzLayer);

   //--------------------------------------------------------------
   //Day/night layer
   var daynightLayer = new dataLayerObject('daynightLayer', 
      function showdaynightLayer(thislayer, callback) {
         //console.log('Displaying daynight layer');
         if (map.getZoom() > 8) {
            thislayer.data.setMap(null);
         }
         else {
            thislayer.data.setMap(map);
         }

         callback();
      }, 
      function hidedaynightLayer() {
         //console.log('hiding daynight layer');
         this.data.setMap(null);
      },
      true  //force refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   daynightLayer.data = new DayNightOverlay({
      map: null      //keep it hidden initially
   });
   dataLayers.push(daynightLayer);

   //--------------------------------------------------------------
   //EEZ layer
   var eezLayer = new dataLayerObject('eezLayer', 
      function showeezLayer(thislayer, callback) {
         //console.log('Displaying EEZ layer');
         thislayer.data.setMap(map);

         //Done drawing method for EEZ
         var dataDisplayedListener = google.maps.event.addListener(thislayer.data, "metadata_changed", 
            function() {
               //console.log('EEZ done displaying');
               google.maps.event.removeListener(dataDisplayedListener);
               callback();
            });
      },
      function hideeezLayer() {
         this.data.setMap(null);
      },
      false //don't refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   eezLayer.data = new google.maps.KmlLayer({
      url: EEZ_PATH,
      preserveViewport: true,
      map: null      //keep it hidden initially
   });
   dataLayers.push(eezLayer);

   //--------------------------------------------------------------
   //Country Borders layer
   var countryBordersLayer = new dataLayerObject('countryBordersLayer', 
      function showCountryBordersLayer(thislayer, callback) {
         thislayer.data.setMap(map);

         //Done drawing method for Country Borders
         var dataDisplayedListener = google.maps.event.addListener(thislayer.data, "metadata_changed", 
            function() {
               //console.log('Country Borders done displaying');
               google.maps.event.removeListener(dataDisplayedListener);
               callback();
            });
      },
      function hideCountryBordersLayer() {
         this.data.setMap(null);
      },
      false //don't refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   countryBordersLayer.data = new google.maps.KmlLayer({
      url: COUNTRY_BORDERS_PATH,
      preserveViewport: true,
      map: null      //keep it hidden initially
   });
   dataLayers.push(countryBordersLayer);

   //--------------------------------------------------------------
   //FMV layer
   var fmvLayer = new dataLayerObject('fmvLayer', 
      function showfmvLayer(thislayer, callback) {
         //console.log('Displaying FMV layer');
         //Function handles setMap of data
         getFMVTargets(null, thislayer, callback);
      },
      function hidefmvLayer() {
         clearLayerMarkers(this);
      },
      true  //force refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   fmvLayer.data = {
      dataArray: [],
      markerArray: [],
      markerlabelArray: []
   };
   fmvLayer.markerpath = 'M 0, 0 m -6, 0 a 6,6 0 1,0 12,0 a 6,6 0 1,0 -12,0';
   fmvLayer.phpfile = 'query_fmv_data.php';
   fmvLayer.resultCount = 0;
   dataLayers.push(fmvLayer);

   //--------------------------------------------------------------
   //Ports layer
   var portsLayer = new dataLayerObject('portsLayer', 
      function showportsLayer(thislayer, callback) {
         //console.log('Displaying ports layer');
         //Function handles setMap of data
         showPorts(thislayer.portIcons, thislayer.portCircles, thislayer.portLabel, thislayer.portPolygons, thislayer, callback);
      },
      function hideportsLayer() {
         var portIcons = this.portIcons;
         var portCircles = this.portCircles;
         var portIcon;
         var portCircle;
         for (i=0; i< portIcons.length; i++) {
            portIcon = portIcons[i];
            portIcon.setMap(null);
            portCircle = portCircles[i];
            portCircle.setMap(null);
         }
         emptyArray(portIcons);
         emptyArray(portCircles);
      },
      true  //force refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   portsLayer.portIcons = [];
   portsLayer.portCircles = [];
   portsLayer.portLabel;
   portsLayer.portPolygons = [];
   dataLayers.push(portsLayer);

   //--------------------------------------------------------------
   //Weather layer
   var weatherLayer = new dataLayerObject('weatherLayer', 
      function showweatherLayer(thislayer, callback) {
         //console.log('Displaying weather layer');
         thislayer.weatherLayer.setMap(map);
         thislayer.cloudLayer.setMap(map);

         //Done drawing for weather
         callback();
      },
      function hideweatherLayer() {
         this.weatherLayer.setMap(null);
         this.cloudLayer.setMap(null);
      },
      false //don't refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   weatherLayer.weatherLayer = new google.maps.weather.WeatherLayer({
		temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
	});
   weatherLayer.cloudLayer = new google.maps.weather.CloudLayer();
   dataLayers.push(weatherLayer);

   //--------------------------------------------------------------
   //Traffic layer
   var trafficLayer = new dataLayerObject('trafficLayer', 
      function showtrafficLayer(thislayer, callback) {
         //console.log('Displaying traffic layer');
         thislayer.data.setMap(map);

         //Done drawing for traffic
         callback();
      },
      function hidetrafficLayer() {
         this.data.setMap(null);
      },
      false //don't refresh this layer
      );

   //Define the day night layer object, append to a dataLayer to dataLayerObject
   trafficLayer.data = new google.maps.TrafficLayer();
   dataLayers.push(trafficLayer);
});

/* -------------------------------------------------------------------------------- */
/** 
 * Return the current map view bounds
 */
function updateViewBounds() {
   var bounds = map.getBounds();

   //Set buffer around map bounds to expand queried area slightly outside viewable area
   var latLonBuffer = expandFactor / Math.pow(map.getZoom(),3);
   //console.log('Current zoom: ' + map.getZoom());

   var ne = bounds.getNorthEast();
   var sw = bounds.getSouthWest();

   var viewMinLat = sw.lat();
   var viewMaxLat = ne.lat();
   var viewMinLon = sw.lng();
   var viewMaxLon = ne.lng();

   var minLat = viewMinLat;// - latLonBuffer;
   var maxLat = viewMaxLat;// + latLonBuffer;
   var minLon = viewMinLon;// - latLonBuffer;
   var maxLon = viewMaxLon;// + latLonBuffer;

   latlonbounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(minLat, minLon), 
         new google.maps.LatLng(maxLat, maxLon));

   //Draw bounds rectangle to let user know they are zooming outside of the bounds
   if (boundRectangle == null) {
      boundRectangle = new google.maps.Rectangle({
         strokeColor: '#FF0000',
         strokeOpacity: 0.8,
         strokeWeight: 1,
         fillColor: '#FF0000',
         fillOpacity: 0,
         map: map,
         bounds: latlonbounds,
         clickable: false,
      });
   }
   else {
      boundRectangle.setBounds(latlonbounds);
   }

   //Update global view bounds
   viewBounds = {
      minLat: minLat, 
      maxLat: maxLat, 
      minLon: minLon, 
      maxLon: maxLon,
      boundStr: "&minlat=" + Math.round(minLat*1000)/1000 + "&maxlat=" + Math.round(maxLat*1000)/1000 + "&minlon=" + Math.round(minLon*1000)/1000 + "&maxlon=" + Math.round(maxLon*1000)/1000,
   };
}

/* -------------------------------------------------------------------------------- */
/**
 * Refresh all layers here, based on sortable lists in UI
 **/
function refreshLayers(newShownLayerID, newHiddenLayerID) {
   //Clear console on refresh
   //console.clear();

   //Update time of refresh
   lastRefresh = new Date();

   //Update view bounds object (viewBounds), global for all layers
   updateViewBounds();

   //Check if layers were changed
   if (typeof newShownLayerID !== 'undefined' || typeof newHiddenLayerID !== 'undefined') {
      //One layer was moved, so update that single layer (either show or hide)

      //Find the layer to be shown, and show it
      dataLayers.forEach( function(dataLayer) {
         if (dataLayer.layerID == newShownLayerID) {
            //console.debug('*********** calling showLayer function');
            dataLayer.showLayer();
         }
      });

      //Find the layer to be hidden, and hide it
      dataLayers.forEach( function(dataLayer) {
         if (dataLayer.layerID == newHiddenLayerID) {
            //console.debug('*********** calling hideLayer function');
            dataLayer.hideLayer();
            if (isNumber(dataLayer.resultCount)) {
               updateGlobalResultCount(null, dataLayer.resultCount);
            }
         }
      });
   }
   else {
      //Perform normal refresh of all layers

      //Reset global target count
      globalResultCount = 0;

      //Loop through layers to be shown and show them
      var layersToShow = $('#displayedLayersList').sortable('toArray');
      //console.log(layersToShow);

      layersToShow.forEach( function(layerToShow) {
         dataLayers.forEach( function(dataLayer) {
            if (dataLayer.layerID == layerToShow && dataLayer.updateIfShown) {
               //console.debug('*********** calling showLayer function');
               dataLayer.showLayer();
            }

            //Flag visibility of aisLayer
            if (layerToShow == 'aisLayer') {
               aisDisplayed = true;
            }
         });
      });

      //Loop through layers to be hidden and hide them
      var layersToHide = $('#hiddenLayersList').sortable('toArray');
      //console.log(layersToHide);

      layersToHide.forEach( function(layerToHide) {
         dataLayers.forEach( function(dataLayer) {
            if (dataLayer.layerID == layerToHide) {
               //console.debug('*********** calling hideLayer function');
               dataLayer.hideLayer();
            }

            //Flag visibility of aisLayer
            if (layerToHide == 'aisLayer') {
               aisDisplayed = false;
            }
         });
      });
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get AIS data from JSON, which is from database, with bounds.
 */
function getAISFromDB(thislayer, callback) {
   //TODO: fix custom queries
   customQuery = null;

   console.log("Refreshing AIS targets...");
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');
   $('#stats').empty();

   var phpWithArg;

   //Notify PHP script which table to query from.
   var sourceStr = 'source=AIS';

   //Look for search
   if (isSearchMode()) {
      phpWithArg = thislayer.phpfile + '?' + sourceStr;

      if (enableRisk) {
         phpWithArg += "&risk=1";
      }

      if ($('#mssisonly:checked').length != 0) {
         phpWithArg += "&mssisonly=1";
      }

      if ($('#sataisonly:checked').length != 0) {
         phpWithArg += "&sataisonly=1";
      }

      if (vesseltypeFilterPHPStr != '') {
         phpWithArg += vesseltypeFilterPHPStr;
      }

      //if vessel age limit was chosen, then add option
      if (vessel_age != -1) {
         phpWithArg += "&vessel_age=" + vessel_age;
      }

      //Time Machine
      if (TimeMachineEnd != null) {
         //Time Machine enabled
         phpWithArg += "&endtime=" + TimeMachineEnd;
      }

      phpWithArg += viewBounds.boundStr;

      enableCustomQuery = false;
   }
   else {   
      //Something was typed into search bar, entering search mode
      phpWithArg = thislayer.phpfile + '?' + sourceStr + viewBounds.boundStr + "&keyword=" + searchTerm;
   }

   //Debug query output
   console.log(thislayer.layerID + ': ' + phpWithArg);

   //Keep track of newest PHP request, current one may not be the newest one by the time data is received
   thislayer.latestCall = phpWithArg;

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         clearLayerMarkers(thislayer);

         //Check if newer query exists, cancel current operation if newer one does exist
         if (thislayer.latestCall !== phpWithArg) { 
            console.log('Newer PHP call exists, canceling this call');
            console.log(' current call: ' + phpWithArg);
            console.log(' last call: ' + thislayer.latestCall);

            callback(false);
            return;
         }
         /*
            console.log(' current call: ' + phpWithArg);
            console.log(' last call: ' + thislayer.latestCall);
            console.log(phpWithArg.indexOf('source=LAISIC') == -1);
            console.log(thislayer.latestCall !== phpWithArg);
         */

         //Check if user removed layer before this function finished
         if ($('#'+thislayer.layerID).parent('#displayedLayersList').length == 0) {
            console.log('Layer was removed; discard retrieved data');
            clearLayerMarkers(thislayer);
            
            callback();
            return;
         }

         //console.log(thislayer.layerID + ': ' + response.query);
         //Show the query and put it in the form
         $('#' + thislayer.layerID + ' .queryStatement').val(response.query);

         localStorage.setItem('query-timestamp', Math.floor((new Date()).getTime()/1000));
         localStorage.setItem('query', response.query);

         if (!customQuery) {
            mainQuery = response.basequery;
         }

         //Prepare to grab PHP results as JSON objects
         $.each(response.vessels, function(key,vessel) {
            //Push to localStorage for tables to know of change
            localStorage.setItem('vessel-'+vessel.mmsi, "0");
               
            var point = new google.maps.LatLng(
               parseFloat(vessel.lat),
               parseFloat(vessel.lon));

            var iconColor = getIconColor(vessel.vesseltypeint, vessel.streamid);

            //Slightly different style for vessels with valid risk score
            if (enableRisk && (vessel.risk_score_safety != null || vessel.risk_score_security != null)) {
               var riskColorSafety = getRiskColor(vessel.vesseltypeint, vessel.streamid, vessel.safety_rating);
               var riskColorSecurity = getRiskColor(vessel.vesseltypeint, vessel.streamid, vessel.security_rating);
                  var marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         thislayer.markerpath, //'M 0,8 4,8 4,-3 0,-8 -4,-3 -4,8 z', //middle rear
                        strokeColor:  riskColorSafety,
                        strokeWeight: vw*3/4,
                        fillColor:    iconColor,
                        fillOpacity:  0.6,
                        optimized:    false,
                        rotation:     parseInt(vessel.heading)
                     }
                  });
            }
            else {   //regular style for AIS vessels with no risk info
               var marker = new google.maps.Marker({
                  position: point,
                  icon: {
                     path:         thislayer.markerpath, //'M 0,8 4,8 4,-3 0,-8 -4,-3 -4,8 z', //middle rear
                  strokeColor:  shadeColor(iconColor,-50),
                  strokeWeight: vw/4,
                  fillColor:    iconColor,
                  fillOpacity:  0.8,
                  rotation:     parseInt(vessel.heading),
                  optimized:    false,
                  }
               });
            }               

            //Listener for click on marker to display infoBubble
            google.maps.event.addListener(marker, 'click', function () {
               //Associate the infoBubble to the marker
               clearInterval(vesselLastUpdated);

               //Draw the selection square
               selectionIndicator(point);

               //Setup the infoBubble and show it
               markerInfoBubble(marker, vessel, infoBubble, 'AIS');

               //Close the infoBubble if user clicks outside of infoBubble area
               google.maps.event.addListenerOnce(map, 'click', function() {
                  if (enableIHSTabs) {
                     for (var i=0; i < NUM_INFO_BUBBLE; i++) {
                        console.log('Removing tab ' + i);
                        infoBubble.removeTab(0);
                     }
                  }
                  clearInterval(vesselLastUpdated);
                  selectionSquare.setMap(null);
                  infoBubble.setMap(null);
                  infoBubble.close(); 
               });
            });

            //Listener for mouseover marker to display tracks
            google.maps.event.addListener(marker, 'mouseover', function() {
               //Hover display name
               if (vessel.vesselname != null && vessel.vesselname.length != 0) {
                  marker.setTitle(vessel.vesselname.trim());
               }
               else {
                  marker.setTitle(vessel.mmsi);
               }
            });

            //Listen for marker right clicks (to query and display track)
            google.maps.event.addListener(marker, 'rightclick', function() {
               console.log('Getting track for: ' + vessel.mmsi+','+vessel.vesseltypeint+',AIS,'+vessel.datetime+','+vessel.streamid+','+vessel.commsid);

               getAISTrack(vessel.mmsi, vessel.vesseltypeint);
            });

            //Prepare vessel labels
            var vessellabel = '';
            if (vessel.vesselname != null && vessel.vesselname != '') {
               vessellabel = vessel.vesselname;
               //vessellabel = vessel.mmsi;
            }
            else {
               vessellabel = vessel.mmsi;
            }

            //add vesselnameLabel to markersDisplayed array
            vesselnameLabel = new InfoBox({
                 content: vessellabel,
                 boxStyle: {
                   border: "0px dashed black",
                   textAlign: "center",
                   //fontSize: "10pt",  //Define text styling properties in CSS file
                   width: "120px"
                 },
                 disableAutoPan: true,
                 pixelOffset: new google.maps.Size(-60, 10),
                 position: new google.maps.LatLng(vessel.lat, vessel.lon),
                 closeBoxURL: "",
                 isHidden: false,
                 pane: "mapPane",
                 enableEventPropagation: true
            });

            vesselnameLabel.open(map);

            //Prepare data for creating marker infoWindows/infoBubbles later
            thislayer.data.dataArray.push(vessel);
            thislayer.data.markerArray.push(marker);
            thislayer.data.markerlabelArray.push(vesselnameLabel);
         });

         //Display the appropriate layer according to the sidebar checkboxes
         if (document.getElementById("HeatmapLayer") && document.getElementById("HeatmapLayer").checked) {
            addHeatmap();
         }
         else {
            //Show the individual vessel markers
            thislayer.data.markerArray.forEach( function (marker) {
               marker.setMap(map);
            });
            if ($('#showtargetlabels:checked').length > 0) {
               thislayer.data.markerlabelArray.forEach( function (markerlabel) {
                  markerlabel.setMap(map);
               });
            }
            else {
               thislayer.data.markerlabelArray.forEach( function (markerlabel) {
                  markerlabel.setMap(null);
               });
            }
         }

         //Check if user wants to display all tracks (from URL request)
         // Need to be careful if user has "queryTracks=all" in the URL request, 
         // then starts clicking around on LAISIC outputs, etc.  All tracks will be queried unintentionally.
         var trackDisplayArgument = Request.QueryString("queryTracks").toString();
         if (trackDisplayArgument == 'all') {
            queryAllTracks();
            document.getElementById("queryalltracks").checked = true;
         }

         thislayer.resultCount = response.resultcount;
         updateGlobalResultCount(thislayer.resultCount);

         callback();
      }) //END .done()
      .fail(function(d, textStatus, error) { 
         if (typeof d.responseText !== 'undefined' && d.responseText.indexOf("Can't connect to MySQL server") > -1) {
            console.log(thislayer.layerID + ': ' +  'Database is down'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('DATABASE IS DOWN.');
         }
         else {
            //Update activity status spinner and results
            console.log(thislayer.layerID + ': ' +  'No response from track query; error in php?'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('ERROR IN QUERY.  PLEASE TRY AGAIN.');
         }
         
         callback(false);
      }); //END .fail()
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to get track from track query PHP script
 */
function getAISTrack(mmsi, vesseltypeint) { //mmsi, vesseltypeint, source, datetime, streamid, trknum) {
   var thislayer = dataLayers[getdataLayerIndex('AIS-track')];
   var trackLayerData = thislayer.data;

   showBusyIndicator();

   //Check if track is already displayed or not
   if ($.inArray(mmsi, trackLayerData.MMSIArray) == -1) {
      var phpWithArg = thislayer.phpfile + '?source=' + thislayer.source + "&targetid=" + mmsi;

      //if history trail limit was chosen, then add option
      if (history_trail_length != -1) {
         phpWithArg += "&history_trail_length=" + history_trail_length;
      }

      //TODO: implement Time Machine tracks

      //Debug query output
      console.log('getAISTrack(): ' + phpWithArg);

      var trackLine = new google.maps.Polyline();

      $.getJSON(
            phpWithArg, // The server URL 
            { }
            ) //end .getJSON()
               .done(function (response) {
                  //console.log('getAISTrack(): ' + response.query);
                  console.log('getAISTrack(): ' + 'track history size = ' + response.resultcount);

                  if (response.resultcount > 0) {
                     var trackData = new Array();
                     var trackIcons = new Array();
                     var trackPath = new Array();

                     //Loop through each time point of the same vessel
                     $.each(response.vessels, function(index, trackVertex) {
                        //Save each vertex data
                        trackData.push(trackVertex);

                        //Save each vertex
                        trackPath[index] = new google.maps.LatLng(trackVertex.lat, trackVertex.lon);

                        //Set Google Map markers for each vertex
                        var tracklineIcon = new google.maps.Marker({
                           icon: thislayer.tracklineIconsOptions
                        });
                        tracklineIcon.setPosition(trackPath[index]);
                        
                        if ($('#showtrackicons:checked').length > 0) {
                           tracklineIcon.setMap(map);
                        }
                        else {
                           tracklineIcon.setMap(null);
                        }

                        tracklineIcon.setTitle('MMSI: ' + mmsi + '\nDatetime: ' + toHumanTime(trackVertex.datetime) + '\nDatatime (unixtime): ' + trackVertex.datetime + '\nLat: ' + trackVertex.lat + '\nLon: ' + trackVertex.lon + '\nHeading: ' + trackVertex.true_heading + '\nSOG: ' + trackVertex.sog + '\nSource: ' + thislayer.source);

                        trackIcons.push(tracklineIcon);


                        //Add listener to delete track if right click on icon
                        google.maps.event.addListener(tracklineIcon, 'rightclick', function(event) {
                           thislayer.deleteTrack(mmsi);
                        });

                        //Dead reckoning
                        //Add listener to project to predicted location if click on icon (dead reckoning)
                        google.maps.event.addListener(tracklineIcon, 'mousedown', function() {
                           if (typeof trackData[index+1] === 'undefined') {
                              return;
                           }
                           //Grab next chronological time and compare time difference
                           var time = (trackData[index+1].datetime - trackData[index].datetime)/60/60; 
                           if (time == 0 && (index+2) < 0) {
                              time = (trackData[index+2].datetime - trackData[index].datetime)/60/60;
                           }
                           var d = (trackVertex.sog*1.852)*time; //convert knots/hr to km/hr
                           var R = 6371; //km

                           var lat1 = parseFloat(trackVertex.lat)*Math.PI/180;
                           var lon1 = parseFloat(trackVertex.lon)*Math.PI/180;
                           var brng = parseFloat(trackVertex.true_heading)*Math.PI/180;

                           var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );

                           var lon2 = lon1 + Math.atan2(
                              Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
                              Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

                           lat2 = lat2 * 180/Math.PI;
                           lon2 = lon2 * 180/Math.PI;

                           var prediction = new google.maps.Marker({
                              position: new google.maps.LatLng(lat2,lon2),
                               map:         map,
                               icon: {
                                  path:        'M 0,8 4,8 0,-8 -4,8 z',
                               strokeColor: '#0000FF',
                               fillColor:   '#0000FF',
                               fillOpacity: 0.6,
                               rotation:    parseFloat(trackVertex.true_heading),
                               }
                           });

                           var predictionCircle = new google.maps.Circle({
                              center:         new google.maps.LatLng(trackVertex.lat, trackVertex.lon),
                               radius:         d*1000,
                               strokeColor:    '#0000FF',
                               strokeOpacity:  0.8,
                               strokeWeight:   1,
                               fillColor:      '#0000FF',
                               fillOpacity:    0.2,
                               map:            map
                           });


                           google.maps.event.addListener(predictionCircle, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(prediction, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(tracklineIcon, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(map, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                        });
                     });

                     trackLine.setOptions({
                        strokeColor:   getIconColor(vesseltypeint), 
                        strokeOpacity: 0.7,
                        strokeWeight:  4,
                     });
                     trackLine.setPath(trackPath);
                     trackLine.setMap(map);

                     //Keep track of which MMSIs have tracks displayed
                     trackLayerData.MMSIArray.push(mmsi);
                     trackLayerData.trackDataArray.push({
                        trackData: trackData,               //array of objects
                        trackIcons: trackIcons,             //array of Google Maps objects
                        trackPath: trackPath,               //array of Google Maps objects
                        trackLine: trackLine,               //Google Maps object
                        resultCount: response.resultcount   //value
                     });

                     //Notify tables that history trail was acquired for a vessel
                     //TODO
                     /*
                     localStorage.setItem('historytrailquery-'+tracksDisplayedID[tracksDisplayedID.length-1], response.query);
                     localStorage.setItem('historytrailtype-'+tracksDisplayedID[tracksDisplayedID.length-1], trackLayerData.source);
                     */

                     //Set up track time slider
                     //TODO: createTrackTimeControl(map, 251, tracksDisplayed);

                     //Add listener to delete track if right click on track line 
                     google.maps.event.addListener(trackLine, 'rightclick', function() {
                        thislayer.deleteTrack(mmsi);
                     });
                  }

                  hideBusyIndicator();
               }) //end .done()
            .fail(function() { 
               console.log('getAISTrack(): ' +  'No response from track query; error in php?'); 
            }); //end .fail()
   }
   else {
      console.log('getAISTrack(): Track for ' + mmsi + ' is already displayed.');
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Delete all AIS tracks
 */
function deleteAISTracks(thislayer) {
   thislayer.data.trackDataArray.forEach( function (trackData, index) {
      //Handle AIS track layer with MMSI array
      thislayer.deleteTrack(thislayer.data.MMSIArray[index]);
   });
   thislayer.data.MMSIArray = [];
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get LAISIC data from JSON, which is from database, with bounds.
 */
function getLAISICFromDB(sourceType, thislayer, callback) {
   //sourceType = 'LAISIC';//TODO: LAISIC_AIS_TRACK or other LAISIC layers, not simply LAISIC

   //TODO: fix custom queries
   customQuery = null;

   console.log("Refreshing LAISIC targets...");
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');
   $('#stats').empty();

   var phpWithArg;

   var sourceStr = "source=" + sourceType;

   //Check if a query has been previously made, and use it to preserve previous query but just change the bounds to current view now
   if (isSearchMode()) {     //No custom search
      phpWithArg = thislayer.phpfile + '?' + sourceStr;

      if (enableRisk) {
         phpWithArg += "&risk=1";
      }

      //if vessel age limit was chosen, then add option
      if (vessel_age != -1) {
         phpWithArg += "&vessel_age=" + vessel_age;
      }

      //Time Machine
      if (TimeMachineEnd != null) {
         //Time Machine enabled
         phpWithArg += "&endtime=" + TimeMachineEnd;
      }

      phpWithArg += viewBounds.boundStr;

      enableCustomQuery = false;
   }
   else {   //Something was typed into query bar
      phpWithArg = thislayer.phpfile + '?' + sourceStr + viewBounds.boundStr + "&keyword=" + searchTerm;
   }

   //Debug query output
   console.log(thislayer.layerID + ': ' + phpWithArg);

   //Keep track of newest PHP request, current one may not be the newest one by the time data is received
   thislayer.latestCall = phpWithArg;

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         clearLayerMarkers(thislayer);

         //Check if newer query exists, cancel current operation if newer one does exist
         if (thislayer.latestCall !== phpWithArg &&
            //allow LAISIC queries to override if last layer was LAISIC related
            phpWithArg.indexOf('source=LAISIC') == -1) { 
            console.log('Newer PHP call exists, canceling this call');
            console.log(' current call: ' + phpWithArg);
            console.log(' last call: ' + thislayer.latestCall);
            return;
         }
         /*
            console.log(' current call: ' + phpWithArg);
            console.log(' last call: ' + thislayer.latestCall);
            console.log(phpWithArg.indexOf('source=LAISIC') == -1);
            console.log(thislayer.latestCall !== phpWithArg);
         */

         //Check if user removed layer before this function finished
         if ($('#'+thislayer.layerID).parent('#displayedLayersList').length == 0) {
            console.log('Layer was removed; discard retrieved data');
            clearLayerMarkers(thislayer);
            
            callback();
            return;
         }         

         //console.log(thislayer.layerID + ': ' + response.query);
         //Show the query and put it in the form
         $('#' + thislayer.layerID + ' .queryStatement').val(response.query);

         localStorage.setItem('query-timestamp', Math.floor((new Date()).getTime()/1000));

         //Read global variable sourceType to determine which type to query (AIS, or LAISIC stuff)
         switch (sourceType) {
            case "LAISIC_AIS_TRACK":
               localStorage.setItem('query-LAISIC_AIS_TRACK', response.query);
               break;
            case "LAISIC_RADAR":
               localStorage.setItem('query-LAISIC_RADAR', response.query);
               break;
            case "LAISIC_AIS_OBS":
               localStorage.setItem('query-LAISIC_AIS_OBS', response.query);
               break;
            default:
               break;
         }


         if (!customQuery) {
            mainQuery = response.basequery;
         }

         //Prepare to grab PHP results as JSON objects
         $.each(response.vessels, function(key,vessel) {
               //Push to localStorage for tables to know of change
               switch (sourceType) {
                  case "LAISIC_AIS_TRACK":
                     localStorage.setItem('laisicaistrack-'+vessel.trknum, "1");
                     break;
                  case "LAISIC_RADAR":
                     localStorage.setItem('laisicradar-'+vessel.trknum, "1");
                     break;
                  case "LAISIC_AIS_OBS":
                     localStorage.setItem('laisicaisobs-'+vessel.obsguid, "1");
                     break;
                  default:
                     break;
               }               


               var point = new google.maps.LatLng(
                     parseFloat(vessel.lat),
                     parseFloat(vessel.lon));

               if (sourceType == "LAISIC_AIS_TRACK") {
                  vessel.heading = vessel.cog;
                  vessel.vesseltypeint = 999;
               }
               else if (sourceType == "LAISIC_RADAR") {
                  vessel.heading = vessel.cog;
                  vessel.vesseltypeint = 888;
               }
               else if (sourceType == "LAISIC_AIS_OBS") {
                  vessel.heading = vessel.cog;
                  vessel.vesseltypeint = 777;
               }
               else if (sourceType == "LIVE_LAISIC") {
                  vessel.vesseltypeint = 999;
               }

               var iconColor = getIconColor(vessel.vesseltypeint, vessel.streamid);

               if (sourceType == "LIVE_LAISIC") {
                  marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         'M 0,-9 6,2 4,6 0,8 -4,6 -6,2 Z',
                        strokeColor:  '#FFFF00',//iconColor,
                        strokeWeight: 2,
                        fillColor:    '#FF0000',
                        fillOpacity:  0.8,
                        rotation:     parseFloat(vessel.heading),
                        optimized:    false,
                     },
                     zIndex:       google.maps.Marker.MAX_ZINDEX + 1
                  });
               }
               //Try new marker shape for LAISIC (type 999) contacts
               else if (vessel.vesseltypeint == 999) {// || vessel.vesseltypeint == 777) {
                  marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         'm -5 0 5 -5 5 5 -5 5 z m 12 0 l 8 0',
                        strokeColor:  '#222200',//iconColor,
                        strokeWeight: 1,
                        fillColor:    iconColor,
                        fillOpacity:  0.8,
                        rotation:     parseInt(vessel.heading)-90, //-90 degrees to account for SVG drawing rotation
                        optimized:    false,
                     },
                     zIndex:       google.maps.Marker.MAX_ZINDEX + 1
                  });
               }
               else if (vessel.vesseltypeint == 888) {
                  marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         markerpathradar,
                        strokeColor:  '#222200',//iconColor,
                        strokeWeight: 1,
                        fillColor:    iconColor,
                        fillOpacity:  0.8,
                        rotation:     parseInt(vessel.heading)-90, //-90 degrees to account for SVG drawing rotation
                        optimized:    false,
                     },
                     zIndex:       google.maps.Marker.MAX_ZINDEX + 1
                  });
               }

               //Listener for click on marker to display infoBubble
               google.maps.event.addListener(marker, 'click', function () {
                  //Associate the infoBubble to the marker
                  clearInterval(vesselLastUpdated);

                  //Draw the selection square
                  selectionIndicator(point);

                  //Setup the infoBubble and show it
                  markerInfoBubble(marker, vessel, infoBubble, 'LAISIC');

                  //Close the infoBubble if user clicks outside of infoBubble area
                  google.maps.event.addListenerOnce(map, 'click', function() {
                     if (enableIHSTabs) {
                        for (var i=0; i < NUM_INFO_BUBBLE; i++) {
                           console.log('Removing tab ' + i);
                           infoBubble.removeTab(0);
                        }
                     }
                     clearInterval(vesselLastUpdated);
                     selectionSquare.setMap(null);
                     infoBubble.setMap(null);
                     infoBubble.close(); 
                  });
               });

               //Listener for mouseover marker to display tracks
               google.maps.event.addListener(marker, 'mouseover', function() {
                  //Hover display name
                  if (sourceType == "LAISIC_AIS_TRACK") {
                     marker.setTitle('LAISIC_AIS_TRACK\nTrknum: ' + vessel.trknum + '\nMMSI: ' + vessel.mmsi);
                  }
                  else if (sourceType == "LAISIC_AIS_OBS") {
                     marker.setTitle('LAISIC_AIS_OBS\nMMSI: ' + vessel.mmsi);
                  }
                  else if (sourceType == "LAISIC_RADAR") {
                     marker.setTitle('LAISIC_RADAR\nTrknum: ' + vessel.trknum);
                  }
                  else if (sourceType == "LIVE_LAISIC") {
                     marker.setTitle('LAISIC Correlation\nRADAR Track ID: ' + vessel.commsid + '\nAIS MMSI: ' + vessel.mmsi);
                  }
                  else if (vessel.vesselname != null && vessel.vesselname.length != 0) {
                     marker.setTitle(vessel.vesselname.trim());
                  }
                  else {
                     marker.setTitle(vessel.mmsi);
                  }
               });

               //Listen for marker right clicks (to query and display track)
               google.maps.event.addListener(marker, 'rightclick', function() {
                  console.log('Getting track for: ' + vessel.mmsi+','+vessel.vesseltypeint+','+sourceType+','+vessel.datetime+','+vessel.streamid+','+vessel.commsid);
                  //TODO: transition to new track layer method
                  console.log('history tracks for LAISIC layers not yet implemented - (TODO)');
                  //getTrack(vessel.mmsi, vessel.vesseltypeint, sourceType, vessel.datetime, vessel.streamid, vessel.commsid);
                  //if LAISIC, use trknum
               });

               //Prepare vessel labels
               var vessellabel = '';
               if (vessel.vesselname != null && vessel.vesselname != '') {
                  vessellabel = vessel.vesselname;
               }
               else if (vessel.trknum != null && vessel.trknum != '') {
                  vessellabel = vessel.trknum;
               }
               else {
                  vessellabel = vessel.mmsi;
               }

               //InfoBox to display many labels with no problems
               vesselnameLabel = new InfoBox({
                    content: vessellabel,
                    boxStyle: {
                      border: "0px dashed black",
                      textAlign: "center",
                      //fontSize: "10pt",  //Define text styling properties in CSS file
                      width: "120px"
                    },
                    disableAutoPan: true,
                    pixelOffset: new google.maps.Size(-60, 10),
                    position: new google.maps.LatLng(vessel.lat, vessel.lon),
                    closeBoxURL: "",
                    isHidden: false,
                    pane: "mapPane",
                    enableEventPropagation: true
               });

               vesselnameLabel.open(map);

               //Prepare data for creating marker infoWindows/infoBubbles later
               thislayer.data.dataArray.push(vessel);
               thislayer.data.markerArray.push(marker);
               thislayer.data.markerlabelArray.push(vesselnameLabel);
         });

         //Display the appropriate layer according to the sidebar checkboxes
         if (document.getElementById("HeatmapLayer") && document.getElementById("HeatmapLayer").checked) {
            addHeatmap();
         }
         else {
            //Show the individual vessel markers
            thislayer.data.markerArray.forEach( function (marker) {
               marker.setMap(map);
            });
            if ($('#showtargetlabels:checked').length > 0) {
               thislayer.data.markerlabelArray.forEach( function (markerlabel) {
                  markerlabel.setMap(map);
               });
            }
            else {
               thislayer.data.markerlabelArray.forEach( function (markerlabel) {
                  markerlabel.setMap(null);
               });
            }
         }

         //Check if user wants to display all tracks (from URL request)
         // Need to be careful if user has "queryTracks=all" in the URL request, 
         // then starts clicking around on LAISIC outputs, etc.  All tracks will be queried unintentionally.
         var trackDisplayArgument = Request.QueryString("queryTracks").toString();
         if (trackDisplayArgument == 'all') {
            queryAllTracks();
            document.getElementById("queryalltracks").checked = true;
         }

         thislayer.resultCount = response.resultcount;
         updateGlobalResultCount(thislayer.resultCount);
         console.log(thislayer.layerID + ': ' + "Total number of LAISIC = " + response.resultcount);

         callback();
      }) //END .done()
      .fail(function(d, textStatus, error) { 
         if (typeof d.responseText !== 'undefined' && d.responseText.indexOf("Can't connect to MySQL server") > -1) {
            console.log(thislayer.layerID + ': ' +  'Database is down'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('DATABASE IS DOWN.');
         }
         else {
            //Update activity status spinner and results
            console.log(thislayer.layerID + ': ' +  'No response from track query; error in php?'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('ERROR IN QUERY.  PLEASE TRY AGAIN.');
         }
         
         callback(false);
      }); //END .fail()
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get counts from clusters
 */
function getClustersFromDB(thislayer, callback) {
   console.log(thislayer.layerID + ': Refreshing targets...');
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');

   var phpWithArg;

   phpWithArg = "query_current_vessels_cluster.php?" + viewBounds.boundStr;

   //if vessel age limit was chosen, then add option
   if (vessel_age != -1) {
      phpWithArg += "&vessel_age=" + vessel_age;
   }
   
   //Time Machine
   if (TimeMachineEnd != null) {
      //Time Machine enabled
      phpWithArg += "&endtime=" + TimeMachineEnd;
   }

   if (detectMobileBrowser()) {
      phpWithArg += "&mobile=1";
   }

   if ($('#mssisonly:checked').length != 0) {
      phpWithArg += "&mssisonly=1";
   }
   if ($('#sataisonly:checked').length != 0) {
      phpWithArg += "&sataisonly=1";
   }

   if (vesseltypeFilterPHPStr != '') {
      phpWithArg += vesseltypeFilterPHPStr;
   }

   //Debug query output
   console.log(thislayer.layerID + ': ' + phpWithArg);


   //Keep track of newest PHP request, current one may not be the newest one by the time data is received
   thislayer.latestCall = phpWithArg;

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         //Check if newer query exists, cancel current operation if newer one does exist
         if (thislayer.latestCall !== phpWithArg &&
            phpWithArg.indexOf('source=LAISIC') == -1) { //allow LAISIC queries to override this check
            console.log('Newer PHP call exists, canceling this call');
            console.log(' current call: ' + phpWithArg);
            console.log(' last call: ' + thislayer.latestCall);
            return;
         }

         //Check if user removed layer before this function finished
         if ($('#'+thislayer.layerID).parent('#displayedLayersList').length == 0) {
            console.log('Layer was removed; discard retrieved data');
            clearLayerMarkers(thislayer);
            
            callback();
            return;
         }

         //console.log(thislayer.layerID + ': ' + response.query);
         //Show the query and put it in the form
         $('#' + thislayer.layerID + ' .queryStatement').val(response.query);

         //Push query to localStorage
         localStorage.clear();
         localStorage.setItem('query-cluster', response.query);
         localStorage.setItem('query-timestamp', (new Date()).getTime());

         mainQuery = response.basequery;

         //Clear previous layer data
         clearLayerMarkers(thislayer);

         var totalsum = 0;


         $.each(response.cluster, function(key,cluster) {
            var leftLon = parseFloat(cluster.leftLon);
            var rightLon = parseFloat(cluster.rightLon);

            if (leftLon > rightLon && (leftLon * rightLon) > 0) {
               var temp = rightLon;
               rightLon = leftLon;
               leftLon = temp;
            }

            if (leftLon > 180) {
               leftLon -= 360;
            }
            if (rightLon > 180) {
               rightLon -= 360;
            }
            if (leftLon < -180) {
               leftLon += 360;
            }
            if (rightLon < -180) {
               rightLon += 360;
            }

            var clusterBounds = new google.maps.LatLngBounds(
                  new google.maps.LatLng(cluster.bottomLat, leftLon), 
                  new google.maps.LatLng(cluster.topLat, rightLon));

            var color;
            if (cluster.clustersum < 50) {
               color = '#00FF00';
            }
            else if (cluster.clustersum > 50 && cluster.clustersum < 100) {
               color = '#FFFF00';
            }
            else {
               color = '#FF0000';
            }

            var clusterBox = new google.maps.Rectangle({
               strokeColor: color,
               strokeOpacity: 1.0,
               strokeWeight: 1,
               fillColor: color,
               fillOpacity: 0.2,
               map: map,
               bounds: clusterBounds,
               clickable: true,
               zIndex: 2
            });

            //Add event for rectangle click
            google.maps.event.addListener(clusterBox, 'click', function (){ map.fitBounds(this.getBounds()); });


            //Cluster box text label
            var boxLabel = new InfoBox({
               content: cluster.clustersum,
               boxStyle: {
                  border: "0px solid black",
                  textAlign: "center",
                  fontSize: "16px",
                  width: "50px",
               },
               disableAutoPan: true,
               pixelOffset: new google.maps.Size(-25, 5),
               position: new google.maps.LatLng((parseFloat(cluster.bottomLat)+parseFloat(cluster.topLat))/2+15/Math.pow(2,map.getZoom()),(parseFloat(cluster.leftLon)+parseFloat(cluster.rightLon))/2),
               closeBoxURL: "",
               isHidden: false,
               enableEventPropagation: true,
            });

            //Attach the InfoBox to the map
            boxLabel.open(map);

            //clusterBoxes.push(clusterBox);
            //clusterBoxesLabels.push(boxLabel);

            thislayer.data.dataArray.push(cluster);
            thislayer.data.markerArray.push(clusterBox);
            thislayer.data.markerlabelArray.push(boxLabel);

            totalsum = totalsum + parseInt(cluster.clustersum);
         });

         console.log(thislayer.layerID + ': ' + "Total number of clusters = " + response.resultcount);
         console.log(thislayer.layerID + ': ' + "Total number of vessels = " + totalsum);

         thislayer.resultCount = totalsum;
         updateGlobalResultCount(thislayer.resultCount);

         callback();
      }) //end .done()
      .fail(function(d, textStatus, error) { 
         if (typeof d.responseText !== 'undefined' && d.responseText.indexOf("Can't connect to MySQL server") > -1) {
            console.log(thislayer.layerID + ': ' +  'Database is down'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('DATABASE IS DOWN.');
         }
         else {
            //Update activity status spinner and results
            console.log(thislayer.layerID + ': ' +  'No response from track query; error in php?'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('ERROR IN QUERY.  PLEASE TRY AGAIN.');
         }

         callback(false);
      }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get RADAR data from JSON, which is from database, with bounds.
 */
function getRADARFromDB(customQuery, thislayer, callback) {
   //Check the data type of this layer (i.e. "AIS", "RADAR", "LAISIC_RADAR", etc.)
   var sourceType = thislayer.dataType;

   console.log(thislayer.layerID + ': Refreshing targets...');
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');

   var phpWithArg = thislayer.phpfile + '?';

   //set data source type for PHP
   var sourceStr = "source=" + sourceType;

   //Check if a query has been previously made, and use it to preserve previous query but just change the bounds to current view now
   if (customQuery == null && customQuery !== '') {     //No custom query
      phpWithArg += sourceStr;

      //if vessel age limit was chosen, then add option
      if (vessel_age != -1) {
         phpWithArg += "&vessel_age=" + vessel_age;
      }

      //Time Machine
      if (TimeMachineEnd != null) {
         //Time Machine enabled
         phpWithArg += "&endtime=" + TimeMachineEnd;
      }

      phpWithArg += viewBounds.boundStr;

      enableCustomQuery = false;
   }
   else {   //Something was typed into query bar
      //TODO: need a more robust condition for keyword search
      if (customQuery.length < 20) {
         //customQuery is really a keyword search
         phpWithArg += sourceStr + viewBounds.boundStr + "&keyword=" + customQuery;
      }
      else {
         console.log(thislayer.layerID + ': Entered custom query: ' + customQuery);

         //If custom query supplies a lat/lon bound, then don't append
         if (customQuery.toLowerCase().indexOf('where l') != -1) {
            console.log(thislayer.layerID + ': Not appending anything to custom query');
            phpWithArg += 'query=' + customQuery + '&noappend=1';
         }
         else {
            //Custom SQL query statement
            phpWithArg += 'query=' + customQuery + viewBounds.boundStr;
         }

         console.log(thislayer.layerID + ': Performing custom query on: ' + customQuery);
         
         //if vessel age limit was chosen, then add option
         if (vessel_age != -1) {
            phpWithArg += "&vessel_age=" + vessel_age;
         }
         
         //Time Machine
         if (TimeMachineEnd != null) {
            //Time Machine enabled
            phpWithArg += "&endtime=" + TimeMachineEnd;
         }
      }
   }


   //Debug query output
   console.log(thislayer.layerID + ': ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         //Check if user removed layer before this function finished
         if ($('#'+thislayer.layerID).parent('#displayedLayersList').length == 0) {
            console.log('Layer was removed; discard retrieved data');
            clearLayerMarkers(thislayer);
            
            callback();
            return;
         }
         
         //console.log(thislayer.layerID + ': ' + response.query);
         //Show the query and show it in the query bar of this layer
         $('#' + thislayer.layerID + ' .queryStatement').val(response.query);

         //Clear previous data and markers
         clearLayerMarkers(thislayer);

         // TODO: clear local storage stuff for this layer

         if (!customQuery) {
            mainQuery = response.basequery;
         }

         //Prepare to grab PHP results as JSON objects
         $.each(response.vessels, function(key,vessel) {
            // TODO: Push to localStorage for tables to know of change

            var latlon = new google.maps.LatLng(
               parseFloat(vessel.lat),
               parseFloat(vessel.lon));

            //var iconColor = getIconColor(vessel.vesseltypeint, vessel.streamid);

            //marker style
            var marker = new google.maps.Marker({
               position: latlon,
                icon: {
                   path:         thislayer.markerpath,
                strokeColor:  thislayer.strokecolor,
                strokeWeight: 1,
                fillColor:    thislayer.markercolor,
                fillOpacity:  0.8,
                rotation:     parseInt(vessel.heading)-90,
                optimized:    false,
                },
                map: map
            });


            //Listener for click on marker to display infoBubble
            google.maps.event.addListener(marker, 'click', function () {
               //Associate the infoBubble to the marker
               clearInterval(vesselLastUpdated);

               //Draw the selection square
               selectionIndicator(latlon);

               //Setup the infoBubble and show it
               markerInfoBubble(marker, vessel, infoBubble, 'RADAR');

               //Close the infoBubble if user clicks outside of infoBubble area
               google.maps.event.addListenerOnce(map, 'click', function() {
                  clearInterval(vesselLastUpdated);
                  selectionSquare.setMap(null);
                  infoBubble.setMap(null);
                  infoBubble.close(); 
               });
            });

            //Listener for mouseover marker to display tracks
            google.maps.event.addListener(marker, 'mouseover', function() {
               //Hover display name
               marker.setTitle(vessel.commsid);
            });

            //Listen for marker right clicks (to query and display track)
            google.maps.event.addListener(marker, 'rightclick', function() {
               console.log(thislayer.layerID + ': Getting track for: ' + vessel.commsid);
               getRADARTrack(vessel.commsid);
            });

            var vessellabel = vessel.commsid;      //TODO: find vessel label field in data
            //Trying InfoBox to display many labels with no problems
            vesselnameLabel = new InfoBox({
               content: vessellabel,
                            boxStyle: {
                               border: "0px dashed black",
                            textAlign: "center",
                            //fontSize: "10pt",  //Define text styling properties in CSS file
                            width: "120px"
                            },
                            disableAutoPan: true,
                            pixelOffset: new google.maps.Size(-60, 10),
                            position: new google.maps.LatLng(vessel.lat, vessel.lon),
                            closeBoxURL: "",
                            isHidden: false,
                            pane: "mapPane",
                            enableEventPropagation: true
            });
            //Associate label to map
            vesselnameLabel.open(map);

            //Check if labels should be displayed or not
            if ($('#showtargetlabels:checked').length == 0) {
               vesselnameLabel.setMap(null);
            }

            //Push data and marker objects into this layer's data arrays
            thislayer.data.dataArray.push(vessel);
            thislayer.data.markerArray.push(marker);
            thislayer.data.markerlabelArray.push(vesselnameLabel);
         });

         //TODO: handle if user wants to display tracks for all currently displayed RADAR targets

         //Update activity status spinner and results
         console.log(thislayer.layerID + ': Total number of targets = ' + thislayer.data.markerArray.length);
         thislayer.resultCount = thislayer.data.markerArray.length;
         updateGlobalResultCount(thislayer.resultCount);

         callback();
      }) //END .done()
      .fail(function(d, textStatus, error) { 
         if (typeof d.responseText !== 'undefined' && d.responseText.indexOf("Can't connect to MySQL server") > -1) {
            console.log(thislayer.layerID + ': Database is down'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('DATABASE IS DOWN.');
         }
         else {
            console.log(thislayer.layerID + ': No response from track query; error in php?'); 
            $('#' + thislayer.layerID + ' .queryStatement').val('ERROR IN QUERY.  PLEASE TRY AGAIN.');
         }

         callback(false);
      }); //END .fail()
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to get RADAR track from track query PHP script
 */
function getRADARTrack(commsid) {
   var thislayer = dataLayers[getdataLayerIndex('RADAR-track')];
   var trackLayerData = thislayer.data;

   showBusyIndicator();

   //Check if track is already displayed or not
   if ($.inArray(commsid, trackLayerData.CommsIDArray) == -1) {
      var phpWithArg = thislayer.phpfile + '?source=' + thislayer.source + "&targetid='" + commsid + "'";

      //if history trail limit was chosen, then add option
      if (history_trail_length != -1) {
         phpWithArg += "&history_trail_length=" + history_trail_length;
      }

      //TODO: implement Time Machine tracks

      //Debug query output
      console.log('getRADARTrack(): ' + phpWithArg);

      var trackLine = new google.maps.Polyline();

      $.getJSON(
            phpWithArg, // The server URL 
            { }
            ) //end .getJSON()
               .done(function (response) {
                  //console.log('getRADARTrack(): ' + response.query);
                  console.log('getRADARTrack(): ' + 'track history size = ' + response.resultcount);

                  if (response.resultcount > 0) {
                     var trackData = new Array();
                     var trackIcons = new Array();
                     var trackPath = new Array();

                     //Loop through each time point of the same vessel
                     $.each(response.vessels, function(index, trackVertex) {
                        //Save each vertex data
                        trackData.push(trackVertex);

                        //Save each vertex
                        trackPath[index] = new google.maps.LatLng(trackVertex.lat, trackVertex.lon);

                        //Set Google Map markers for each vertex
                        var tracklineIcon = new google.maps.Marker({
                           icon: thislayer.tracklineIconsOptions
                        });
                        tracklineIcon.setPosition(trackPath[index]);
                        
                        if ($('#showtrackicons:checked').length > 0) {
                           tracklineIcon.setMap(map);
                        }
                        else {
                           tracklineIcon.setMap(null);
                        }

                        tracklineIcon.setTitle('Track ID: ' + commsid + '\nDatetime: ' + toHumanTime(trackVertex.datetime) + '\nDatatime (unixtime): ' + trackVertex.datetime + '\nLat: ' + trackVertex.lat + '\nLon: ' + trackVertex.lon + '\nHeading: ' + trackVertex.true_heading + '\nSOG: ' + trackVertex.sog + '\nSource: ' + thislayer.source);

                        trackIcons.push(tracklineIcon);


                        //Add listener to delete track if right click on icon
                        google.maps.event.addListener(tracklineIcon, 'rightclick', function(event) {
                           thislayer.deleteTrack(commsid);
                        });

                        //Dead reckoning
                        //Add listener to project to predicted location if click on icon (dead reckoning)
                        google.maps.event.addListener(tracklineIcon, 'mousedown', function() {
                           if (typeof trackData[index+1] === 'undefined') {
                              return;
                           }
                           //Grab next chronological time and compare time difference
                           var time = (trackData[index+1].datetime - trackData[index].datetime)/60/60; 
                           if (time == 0 && (index+2) < 0) {
                              time = (trackData[index+2].datetime - trackData[index].datetime)/60/60;
                           }
                           var d = (trackVertex.sog*1.852)*time; //convert knots/hr to km/hr
                           var R = 6371; //km

                           var lat1 = parseFloat(trackVertex.lat)*Math.PI/180;
                           var lon1 = parseFloat(trackVertex.lon)*Math.PI/180;
                           var brng = parseFloat(trackVertex.true_heading)*Math.PI/180;

                           var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );

                           var lon2 = lon1 + Math.atan2(
                              Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
                              Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

                           lat2 = lat2 * 180/Math.PI;
                           lon2 = lon2 * 180/Math.PI;

                           var prediction = new google.maps.Marker({
                              position: new google.maps.LatLng(lat2,lon2),
                               map:         map,
                               icon: {
                                  path:        'M 0,8 4,8 0,-8 -4,8 z',
                               strokeColor: '#0000FF',
                               fillColor:   '#0000FF',
                               fillOpacity: 0.6,
                               rotation:    parseFloat(trackVertex.true_heading),
                               }
                           });

                           var predictionCircle = new google.maps.Circle({
                              center:         new google.maps.LatLng(trackVertex.lat, trackVertex.lon),
                               radius:         d*1000,
                               strokeColor:    '#0000FF',
                               strokeOpacity:  0.8,
                               strokeWeight:   1,
                               fillColor:      '#0000FF',
                               fillOpacity:    0.2,
                               map:            map
                           });


                           google.maps.event.addListener(predictionCircle, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(prediction, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(tracklineIcon, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                           google.maps.event.addListener(map, 'mouseup', function() {
                              prediction.setMap(null);
                              predictionCircle.setMap(null);
                           });
                        });
                     });

                     trackLine.setOptions({
                        strokeColor:   getIconColor(888), 
                        strokeOpacity: 0.7,
                        strokeWeight:  4,
                     });
                     trackLine.setPath(trackPath);
                     trackLine.setMap(map);

                     //Keep track of which MMSIs have tracks displayed
                     trackLayerData.CommsIDArray.push(commsid);
                     trackLayerData.trackDataArray.push({
                        trackData: trackData,               //array of objects
                        trackIcons: trackIcons,             //array of Google Maps objects
                        trackPath: trackPath,               //array of Google Maps objects
                        trackLine: trackLine,               //Google Maps object
                        resultCount: response.resultcount   //value
                     });


                     //Notify tables that history trail was acquired for a vessel
                     //TODO
                     /*
                     localStorage.setItem('historytrailquery-'+tracksDisplayedID[tracksDisplayedID.length-1], response.query);
                     localStorage.setItem('historytrailtype-'+tracksDisplayedID[tracksDisplayedID.length-1], trackLayerData.source);
                     */

                     //Set up track time slider
                     //TODO: createTrackTimeControl(map, 251, tracksDisplayed);

                     //Add listener to delete track if right click on track line 
                     google.maps.event.addListener(trackLine, 'rightclick', function() {
                        thislayer.deleteTrack(commsid);
                     });
                  }

                  hideBusyIndicator();
               }) //end .done()
            .fail(function() { 
               console.log('getRADARTrack(): ' +  'No response from track query; error in php?'); 
            }); //end .fail()
   }
   else {
      console.log('getRADARTrack(): Track for ' + commsid + ' is already displayed.');
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Delete all RADAR tracks
 */
function deleteRADARTracks(thislayer) {
   /*
   thislayer.data.trackDataArray.forEach( function (trackData, index) {
      //Handle RADAR track layer with CommsID array
      console.log('Deleting track ', index, ' ', thislayer.data.CommsIDArray[index]);
      thislayer.deleteTrack(thislayer.data.CommsIDArray[index]);
   });
   */

   var numToDelete = thislayer.data.trackDataArray.length;
   for (var i=0; i < numToDelete; i++) {
      console.log('Deleting track ', i, ' ', thislayer.data.CommsIDArray[0]);
      thislayer.deleteTrack(thislayer.data.CommsIDArray[0]);
   }

   thislayer.data.CommsIDArray = [];
   thislayer.data.trackDataArray = [];
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get FMV data from JSON, which is from database, with bounds.
 */
function getFMVTargets(customQuery, thislayer, callback) {
   console.log(thislayer.layerID + ': Refreshing targets...');
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');

   var phpWithArg = thislayer.phpfile + '?';

   //if vessel age limit was chosen, then add option
   if (vessel_age != -1) {
      phpWithArg += "&contact_age=" + vessel_age;
   }

   phpWithArg += viewBounds.boundStr;

   //Debug query output
   console.log(thislayer.layerID + ': ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
         ) //end .getJSON()
            .done(function (response) {
               console.log('Received data from FMV php');

               //Clearing all previous markers
               clearLayerMarkers(thislayer);
              
               //Prepare to grab PHP results as JSON objects
               $.each(response.vessels, function(key,vessel) {
                  var latlon = new google.maps.LatLng(
                     parseFloat(vessel.lat),
                     parseFloat(vessel.lon));

                  var marker = new google.maps.Marker({
                     position: latlon,
                      icon: {
                         path:         thislayer.markerpath,
                      strokeColor:  '#000000',
                      strokeWeight: 1,
                      fillColor:    '#ff0000',
                      fillOpacity:  0.5,
                      },
                      map: map
                  });

                  //Listener for click on marker to display infoBubble
                  google.maps.event.addListener(marker, 'click', function () {
                     var contentString = '<div id="content">'+
                     '<h1 id="firstHeading" class="firstHeading">Target ' + vessel.id + '</h1>'+
                     '<div id="bodyContent">'+
                     '<img src="fmvdata/11254.png" width="200px" height="200px"><br>'+
                     'Latitude: ' + vessel.lat + '<br>'+
                     'Longitude: ' + vessel.lon + '<br>'+
                     '</div>'+
                     '</div>';

                     fmvinfowindow.setContent(contentString);

                     fmvinfowindow.open(map,marker);

                     //Draw the selection square
                     selectionIndicator(latlon);

                     //Close the infoBubble if user clicks outside of infoBubble area
                     google.maps.event.addListenerOnce(map, 'click', function() {
                        selectionSquare.setMap(null);
                        fmvinfowindow.setMap(null);
                        fmvinfowindow.close();
                     });
                  });

                  var vessellabel = vessel.id;      //TODO: find vessel label field in data
                  //Trying InfoBox to display many labels with no problems
                  vesselnameLabel = new InfoBox({
                     content: vessellabel,
                                  boxStyle: {
                                     border: "0px dashed black",
                                  textAlign: "center",
                                  //fontSize: "10pt",  //Define text styling properties in CSS file
                                  width: "120px"
                                  },
                                  disableAutoPan: true,
                                  pixelOffset: new google.maps.Size(-60, 10),
                                  position: new google.maps.LatLng(vessel.lat, vessel.lon),
                                  closeBoxURL: "",
                                  isHidden: false,
                                  pane: "mapPane",
                                  enableEventPropagation: true
                  });
                  //Associate label to map
                  vesselnameLabel.open(map);

                  //Check if labels should be displayed or not
                  if ($('#showtargetlabels:checked').length == 0) {
                     vesselnameLabel.setMap(null);
                  }

                  //Push data and marker objects into this layer's data arrays
                  thislayer.data.dataArray.push(vessel);
                  thislayer.data.markerArray.push(marker);
                  thislayer.data.markerlabelArray.push(vesselnameLabel);
               });

               $('#' + thislayer.layerID + ' .queryStatement').val(response.query);

               //TODO: add to global count
               thislayer.resultCount = thislayer.data.markerArray.length;
               updateGlobalResultCount(thislayer.resultCount);
         
               //Notify that this layer is done retrieving data and drawing
               callback();
            }) //END .done()
         .fail(function(d, textStatus, error) { 
            if (typeof d.responseText !== 'undefined' && d.responseText.indexOf("Can't connect to MySQL server") > -1) {
               console.log('getFMVTargets(): ' +  'Database is down'); 
               $('#' + thislayer.layerID + ' .queryStatement').val('DATABASE IS DOWN.');
            }
            else {
               //Update activity status spinner and results
               console.log('getFMVTargets(): ' +  'No response from track query; error in php?'); 
               $('#' + thislayer.layerID + ' .queryStatement').val('ERROR IN QUERY.  PLEASE TRY AGAIN.');
            }

            //Notify that this layer is done retrieving data and drawing
            callback(false);
         }); //END .fail()
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get ports from database, with bounds.
 */
function showPorts(portIcons, portCircles, portLabel, portPolygons, thislayer, callback) {
   console.log(thislayer.layerID + ': Refreshing targets...');
   $('#' + thislayer.layerID + ' .queryStatement').val('QUERY RUNNING...');

   //TODO: separate the 3 port call getJSONs into separate functions with callbacks
   var phpWithArg = "query_ports.php?" + viewBounds.boundStr;

   //Debug query output
   console.log('SHOWPORTS(): ' + phpWithArg);

   $.getJSON(
      phpWithArg, // The server URL 
      { }
   ) //end .getJSON()
   .done(function (response) {
      $('#' + thislayer.layerID + ' .queryStatement').val(response.query);
      console.log('SHOWPORTS(): ' + response.query);
      console.log('SHOWPORTS(): ' + 'number of ports = ' + response.resultcount);

      $.each(response.ports, function(key,port) {
         var port_name = port.port_name;
         var country_name = port.country_code;
         var lat = port.latitude;
         var lon = port.longitude;

         port_location = new google.maps.LatLng(lat, lon);
         var portIcon = new google.maps.Marker({icon: 'icons/anchor_port.png'});
         portIcon.setPosition(port_location);
         portIcon.setMap(map);
         portIcon.setTitle('Port Name: ' + port_name + '\nCountry: ' + country_name + '\nLat: ' + lat + '\nLon: ' + lon);

         portCircle = new google.maps.Circle({
            center:  port_location,
                     radius: 2500,
                     strokeColor: "#FF0000",
                     strokeOpacity: 0.5,
                     strokeWeight: 2,
                     fillColor: "#FF0000",
                     fillOpacity: 0.05,
                     map: map
         });

         portIcons.push(portIcon);
         portCircles.push(portCircle);

         google.maps.event.addListener(portIcon, 'mouseover', function() {
            portLabel = new MapLabel({
               text: port_name,
               position: portIcon.getPosition(),
               map: map,
               fontSize: 16,
               fontColor: "#FF0000",
               align: 'center',
               zIndex: 0
            });
         });

         google.maps.event.addListener(portIcon, 'mouseout', function() {
            if (portLabel != null) {
               portLabel.setMap(null);
            }
         });
      });

      //callback();
   }) //end .done()
   .fail(function() {
      console.log('SHOWPORTS(): ' +  'No response from port query; error in php?'); 

      callback(false);
   }); //end .fail()


   //Testing other/WROS port table
   phpWithArg += "&wrosports=1";
   $.getJSON(
      phpWithArg, // The server URL 
      { }
   ) //end .getJSON()
   .done(function (response) {
      $('#' + thislayer.layerID + ' .queryStatement').val(response.query);
      console.log('SHOWPORTS() part 2: ' + response.query);
      console.log('SHOWPORTS() part 2: ' + 'number of ports = ' + response.resultcount);

      $.each(response.ports, function(key,port) {
         var port_name = port.port_name;
         var country_name = port.country_code;
         var lat = port.latitude;
         var lon = port.longitude;

         port_location = new google.maps.LatLng(lat, lon);
         var portIcon = new google.maps.Marker({icon: 'icons/anchor_port_blue.png'});
         portIcon.setPosition(port_location);
         portIcon.setMap(map);
         portIcon.setTitle('Port Name: ' + port_name + '\nCountry: ' + country_name + '\nLat: ' + lat + '\nLon: ' + lon);

         portCircle = new google.maps.Circle({
            center:  port_location,
                     radius: 2500,
                     strokeColor: "#0000FF",
                     strokeOpacity: 0.5,
                     strokeWeight: 2,
                     fillColor: "#0000FF",
                     fillOpacity: 0.05,
                     map: map
         });

         portIcons.push(portIcon);
         portCircles.push(portCircle);

         google.maps.event.addListener(portIcon, 'mouseover', function() {
            portLabel = new MapLabel({
               text: port_name,
               position: portIcon.getPosition(),
               map: map,
               fontSize: 16,
               fontColor: "#0000FF",
               align: 'center',
               zIndex: 0
            });
         });

         google.maps.event.addListener(portIcon, 'mouseout', function() {
            if (portLabel != null) {
               portLabel.setMap(null);
            }
         });
      });

      callback();
   }) //end .done()
   .fail(function() { 
      console.log('SHOWPORTS() part 2: ' +  'No response from port query; error in php?'); 

      callback(false);
   }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
function showUploadedKMZ(datetime) {
   console.log('Showing KMZ');

   var index = dataLayers[getdataLayerIndex('KMZ')].data.docs.length;

   //Set the map before the first KMZ display.  During initialization, map setting probably
   // wasn't successful, so set it here after map object has been initiated fully.
   dataLayers[getdataLayerIndex('KMZ')].data.setMap(map);

   dataLayers[getdataLayerIndex('KMZ')].data.parse('kmz/' + datetime + '/doc.kml', function() {
      //Add KMZ layer controls to options panel
      var newLayer = $('<li>');
      newLayer.attr('id','kmz-'+index).addClass('list-group-item').appendTo('#uploadedkmzlayers');
      var deleteKMLDiv = $('<div>');
      newLayer.append(deleteKMLDiv);

      var rowDiv = $('<div class="row">');
      deleteKMLDiv.append(rowDiv);

      var colThumbnailDiv = $('<div class="col-lg-8">');
      rowDiv.append(colThumbnailDiv);
      var thumbnail = $('<img id="kmz-'+index+'-thumb" src="'+dataLayers[getdataLayerIndex('KMZ')].data.docs[index].overlays[0].url_+'"  style="max-height: 200px; max-width: 200px; cursor: pointer">');
      thumbnail.appendTo(colThumbnailDiv);

      var colTrashDiv = $('<div class="col-lg-2">');
      rowDiv.append(colTrashDiv);
      var trashButton = $('<button>').attr('id','kmz-'+index+'-delete').addClass('btn').addClass('btn-default').append('<span class="glyphicon glyphicon-trash"></span>').appendTo(colTrashDiv);
      $('#kmz-'+index+'-delete').hide();

      var colNameDiv = $('<div class="col-lg-8">');
      rowDiv.append(colNameDiv);
      colNameDiv.append($('.file-caption-name').val());

      $('#kmz-'+index).hover(
            function() {
               $('#kmz-'+index+'-delete').show();
            },
            function() {
               $('#kmz-'+index+'-delete').hide();
            });

      $('#kmz-'+index+'-thumb').click(function() {
         dataLayers[getdataLayerIndex('KMZ')].data.zoomTo(dataLayers[getdataLayerIndex('KMZ')].data.docs[index]);
      });

      $('#kmz-'+index+'-delete').click(function() {
         deleteKMLLayer(index);
      });
   });
}

/* -------------------------------------------------------------------------------- */
function deleteKMLLayer(index) {
   var numKMLlayers = dataLayers[getdataLayerIndex('KMZ')].data.docs.length;

   if (numKMLlayers > 0 && index <= numKMLlayers-1) {
      for (var i in dataLayers[getdataLayerIndex('KMZ')].data.docs[index].markers) {
         dataLayers[getdataLayerIndex('KMZ')].data.docs[index].markers[i].setMap(null);
      }
      emptyArray(dataLayers[getdataLayerIndex('KMZ')].data.docs[index].markers);
      dataLayers[getdataLayerIndex('KMZ')].data.docs[index].overlays[0].setMap(null);
      dataLayers[getdataLayerIndex('KMZ')].data.docs[index].overlays[0] = null;
      dataLayers[getdataLayerIndex('KMZ')].data.docs[index] = null
   }
   else {
      console.log('Index' + index + 'is out of range of parser docs');
   }

   //Don't splice in order to keep indices consistent with delete button id's
   //dataLayers[getdataLayerIndex('KMZ')].data.docs.splice(index, 1);

   $('#kmz-'+index).remove();
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to empty out an array and set length to zero
 **/
function emptyArray(arr) {
   if (typeof array !== 'undefined') {
      while(arr.length > 0) {
         arr.pop();
      }
   }
   arr.length = 0;
}

/* -------------------------------------------------------------------------------- */
/**
 **/
function codeAddress() {
   var address = document.getElementById('geocodeAddress').value;

   //Check if user entered a lat/lon pair, separated by comma, i.e. "-118, 32"
   if (address.match(/^[0-9\-\,\ \.]+$/) != null) {
      var latlonArray = address.split(',');
      map.panTo(new google.maps.LatLng(parseFloat(latlonArray[0]), parseFloat(latlonArray[1])));
      return;
   }

   geocoder.geocode({
      'address': address,
      'bounds':  map.getBounds()
   }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
         $('#geocodeWarning').hide();
         //Pan to location only
         //map.panTo(results[0].geometry.location);

         //Change entire view
         if (typeof results[0].geometry.bounds !== 'undefined') {
            map.fitBounds(results[0].geometry.bounds);
         }
         else {
            $('#geocodeWarning').show();
         }
      } 
      else {
         alert('Geocode was not successful for the following reason: ' + status);
         $('#geocodeWarning').show();
      }
   });
}

/* -------------------------------------------------------------------------------- */
/**
 * 
 **/
function increaseVesselIconSize() {
   vw += 2;
   vl += 2;

   //TODO: only update AIS layer for now
   //TODO: getdataLayerIndex() returns an array of indices, so need to handle this
   dataLayers[getdataLayerIndex('AIS')].markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';

   refreshLayers();
}

/* -------------------------------------------------------------------------------- */
/**
 * 
 **/
function decreaseVesselIconSize() {
   vw -= 2;
   vl -= 2;

   //TODO: only update AIS layer for now
   //TODO: getdataLayerIndex() returns an array of indices, so need to handle this
   dataLayers[getdataLayerIndex('AIS')].markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';

   refreshLayers();
}

/* -------------------------------------------------------------------------------- */
/**
 * 
 **/
function resetVesselIconSize() {
   vw = 4;
   vl = 10;

   //TODO: only update AIS layer for now
   //TODO: getdataLayerIndex() returns an array of indices, so need to handle this
   dataLayers[getdataLayerIndex('AIS')].markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';

   refreshLayers();
}

/* -------------------------------------------------------------------------------- */
function toggleDistanceTool() {
   if (document.getElementById("distancetooltoggle") 
       && document.getElementById("distancetooltoggle").checked) {
      enableDistanceTool();
   }
   else {
      disableDistanceTool();
   }
}

/* -------------------------------------------------------------------------------- */
function enableDistanceTool() {
   //Distance label
   distanceLabel = new MapLabel({
            text: '',
            //position: new google.maps.LatLng(5.9,1.30),
            map: map,
            fontSize: 14,
            align: 'left',
            map: map
   });
   
   initializeDistanceWidget();
}

/* -------------------------------------------------------------------------------- */
function disableDistanceTool() {
   //Check for global object distanceWidget
   if (distanceWidget != null) {
      //Destroy the object to remove from maps
      distanceWidget.destructor();
   }

   //Separately hide the distanceLabel
   // Not done in distanceWidget.js to retain compability with old distance method
   if (distanceLabel != null) {
      distanceLabel.setMap(null);
   }
}

/* -------------------------------------------------------------------------------- */
function toggleShowTargetLabels() {
   if ($('#showtargetlabels:checked').length > 0) {
      console.log('Showing vessel names');

      dataLayers.forEach( function (dataLayer) {
         if (typeof dataLayer.data !== 'undefined' 
            && typeof dataLayer.data.markerlabelArray !== 'undefined') {
            dataLayer.data.markerlabelArray.forEach( function (markerlabel) {
               markerlabel.setMap(map);
            });
         }
      });
   }
   else {
      console.log('Hiding vessel names');

      dataLayers.forEach( function (dataLayer) {
         if (typeof dataLayer.data !== 'undefined' 
            && typeof dataLayer.data.markerlabelArray !== 'undefined') {
            dataLayer.data.markerlabelArray.forEach( function (markerlabel) {
               markerlabel.setMap(null);
            });
         }
      });
   }
}

/* -------------------------------------------------------------------------------- */
function showBusyIndicator() {
   if ($('#loadingPanel').is(':visible')) {
      return;        //is already shown, return
   }

   //Show the loading panel
   $('#loadingPanel').show();

   //Find the spinner within the loadingPanel and activate it
   $('#loadingPanel').find('.spinner').activity({
      segments: 8, 
      steps: 3, 
      opacity: 0.3, 
      width: 4, 
      space: 0, 
      length: 5, 
      color: '#4D708F', 
      speed: 3.0,
   }); //show spinner

   //Also show the top progress bar at the same time
   NProgress.start();   //JS library top progress bar

   return;
}

/* -------------------------------------------------------------------------------- */
function hideBusyIndicator() {
   $('#loadingPanel').hide();
   $('#loadingPanel').find('.spinner').activity(false); //hide spinner
   NProgress.done();   //JS library top progress bar
    return;
}

/* -------------------------------------------------------------------------------- */
function updateGlobalResultCount(add, subtract) {
   if (isNumber(add)) {
      globalResultCount += add;
   }
   if (isNumber(subtract)) {
      globalResultCount -= subtract;
   }

   if (globalResultCount < 0) {
      console.log('ERROR: Global result count not properly deducted.  Please check code.');
   }

   //document.getElementById('stats').innerHTML = 
   $('#stats').html(
      globalResultCount + " results<br>" + 
      "Retrieved in " + (new Date() - lastRefresh)/1000 + " secs"
      );
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to handle vessel search on AIS data.  Triggered by GUI search bar, advanced
 * search, or via OWF advanced search widget.
 *
 * Input:
 *    params - optional input parameter with search parameters intended to be used by search OWF widget
 **/
function search(params) {
   //check if AIS layer is currently being displayed
   if (!isAISLayerDisplayed()) {
      alert('AIS layer is not being displayed.  Please add layer before performing search');
      return;
   }

   //TODO: handle searches incoming from OWF search widget, indicated by defined params object
   if (typeof params !== 'undefined') {
      //incoming search from OWF widget
      //TODO: parse parameters

      //TODO: pan map to requested search region
   }

   //clear previous search
   if ($('#clearSearch').length > 0) {
      $('#clearSearch').remove();
   }

   if (advancedSearchEnabled) {
      $('#search').attr('placeholder', 'Advanced search filtering enabled');
      searchTerm = $('#searchMMSI').val();
      
      //TODO: handle the other advanced search fields
      
   }
   else {
      $('#search').attr('placeholder', 'Search for Vessels (MMSI, IMO, vessel name, call sign, or destination)');
      //Grab search terms and store to global var
      searchTerm = $('#search').val();
   }

   //Adjust global result count

   //Easter Egg
   if (searchTerm.toLowerCase() == '/clippy') {
      loadClippy();
      return;
   }

   dataLayers.forEach( function(dataLayer) {
      if (dataLayer.layerID == 'aisLayer') {
         updateGlobalResultCount(null, dataLayer.resultCount);
      }
   });

   //Force update AIS data layer only, which will handle the search mode and search terms
   refreshLayers('aisLayer', null);


   //Add a search cancel button
   $('#advancedSearchToggle').before('<span id="clearSearch" class="form-control-feedback noselect glyphicon glyphicon-remove"></span>');

   //handle search cancel button
   $('#clearSearch').click( function(event) {
      $('#search').val('');
      $('#search').attr('placeholder', 'Search for Vessels (MMSI, IMO, vessel name, call sign, or destination)');
      clearSearch();
      $(this).remove();

      //Get regular AIS layer displayed
      refreshLayers('aisLayer', null);
   });

}

/* -------------------------------------------------------------------------------- */
function clearSearch() {
   searchTerm = '';
}

/* -------------------------------------------------------------------------------- */
function isSearchMode() {
   return (searchTerm == '');
}

/* -------------------------------------------------------------------------------- */
function isAISLayerDisplayed() {
   return aisDisplayed;
}

/* -------------------------------------------------------------------------------- */
function adaptiveMapType() {
   if ($('#adaptiveMapType:checked').length !== 0) {
      if (map.getZoom() > 8) {
         map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      }
      else {
         map.setMapTypeId(google.maps.MapTypeId.HYBRID);         
      }
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Returns an array of indices that match dataType in dataLayers
 **/
function getdataLayerIndex(dataType) {
   var indices = [];
   dataLayers.forEach( function(dataLayer, index) {
      if (dataLayer.dataType == dataType) {
         indices.push(index);
      }
   });

   return indices;
}

/* -------------------------------------------------------------------------------- */
/**
 * Draws the selection indicators on vessel click
 **/
function selectionIndicator(latlng) {
   selectionSquare.setPosition(latlng);
   selectionSquare.setMap(map);
   selectionCircle.setOptions(selectionCircleInitOption);
   selectionCircle.setCenter(latlng);
   selectionCircle.setMap(map);

   function fadeCircle() {
      var opacity = selectionCircle.get("fillOpacity");
      var radius = selectionCircle.get("radius");
      opacity -= 0.2;
      radius += 500;
      if (opacity < 0) {
         selectionCircle.setMap(null);
         clearInterval(fadeInterval);
      }
      else {
         selectionCircle.setOptions({fillOpacity:opacity, strokeOpacity:opacity, radius: radius});
      }
   }

   clearInterval(fadeInterval);
   fadeInterval = setInterval(fadeCircle, 100);
}
