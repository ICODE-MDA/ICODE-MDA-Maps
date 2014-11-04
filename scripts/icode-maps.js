/**
 * @name ICODE-MDA Maps
 * @author Sparta Cheung
 * @fileoverview
 * Uses the ArcGIS Maps API to display AIS points at their reported locations
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
var map;                      //main Google Map object

var reloadDelay;              //milliseconds to wait before refreshing the markers after map idle

var markerArray = [];         //array to store all markers
var vesselArray = [];         //array to store all vessel information
var markersDisplayed = [];    //array to keep track of all markers currently displayed

//parallel arrays to keep track of displayed tracks
var tracksDisplayedID = [];   //stores MMSI/trknum of tracks that are displayed
var tracksDisplayed = [];     //stores track objects of tracks that are displayed 

var latestPHPcall;            //last phpWithArgs call
var mainQuery;                //main query called
var prevZoom = null;          //store the last zoom level

//Vessel type filter
var vesseltypeFilterPHPStr = '';

//Cluster boxes for zoomed out view of vessel count instead of showing markers
var clusterBoxes = [];        
var clusterBoxesLabels= [];
var enableCluster;

var autoRefreshHandler;              //interval event handler of map auto refresh
var autoRefreshRate;          //rate of auto refreshing
var lastRefresh;              //time of last map refresh
var vesselLastUpdated;        //time of last vessel report

var distanceLabel;            //text label for distance tool

//Vessel Icon size
var vesseliconwidth = 4;
var vesseliconlength = 10;

//Day/Night Overlay layer
var daynightlayer;

var vessel_age;               //user chosen vessel age, in hours

var history_trail_length;     //user chosen history trail length, in days

var prevSourceType;

//Viewing bounds objects
var queryBounds;              //map bounds of query
var expandFactor = 300;       //factor to expand bounds by outside of viewable area
var boundRectangle = null;    //rectangle map object to draw query bounds

var queryid;                  //ID of query based on timestamp to keep track of map clearing on simultaneous query layers

//Marker timing objects
//var markerMouseoutTimeout;
//var trackMouseoverTimeout;

//Enable risk info flag
var enableRisk;               //Flag to enable or disable risk information in info bubbles

//IHS Tabs global
var NUM_INFO_BUBBLE = 4;      //AIS info at Tab=0 and IHS Fairplay data at  Tab = 1 thru 4
var enableIHSTabs;            //Flag to enable or disable IHS tabs in info bubbles

//Weather layer objects
var weatherLayer;
var cloudLayer;

//Heatmap objects
var HEATMAP = true;
var heatmapLayer;

//Other WMS layers
var WMSTILESIZE = 512;

//Shape drawing objects
var selectedShape;

//KML objects
var KML = false;
var kmlparser;
var kmlparsers = [];
var tempKMLcount = 0;

//Port objects
var Ports = false;
var portIcons = [];
var portCircles = [];

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

//Hide/show panel
var panelhidden = false;

//Time Machine
var enableTimeMachine;
var queryTimeMachine;
var startTimeMachine;
var endTimeMachine;

//Custom search/query
var enableCustomQuery;
var queryCustomQuery;

//var selectionCircle;

//VOLPE's KMZ layers for EEZ and country borders
var EEZ;
var COUNTRYBORDERS;
var COMMON_PATH = "https://mda.volpe.dot.gov/overlays/";
var EEZ_PATH = COMMON_PATH + "eez-layer.kmz";
var COUNTRY_BORDERS_PATH = COMMON_PATH + "Country_Borders.kmz";

//Geocoder
var geocoder;

//Port labels
var portLabel;
var portPolygons = [];

//Traffic layer
var trafficLayer;

//Browser focus
var browserFocus = true;
var queuedRefresh = false;


/* -------------------------------------------------------------------------------- */
/** Initialize, called on main page load
*/
function initialize() {
   //Ship shape
   var vw = vesseliconwidth; //4; //vessel width
   var vl = vesseliconlength; //10; //vessel length
   var markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';

   require([
         "esri/map", 
         "esri/layers/ArcGISTiledMapServiceLayer", 
         "esri/dijit/Scalebar",
         "dojo/number", 
         "esri/geometry/Point", 
         "esri/symbols/SimpleMarkerSymbol", "esri/graphic",
         "dojo/_base/array", "dojo/dom-style", "dojox/widget/ColorPicker", 
         "dojo/on",
         "dojo/query",
         "dojo/dom",
         "dojo/domReady!"
         ], function(Map, 
            ArcGISTiledMapServiceLayer, 
            Scalebar, 
            number,
            Point,
            SimpleMarkerSymbol, Graphic,
            arrayUtils, domStyle, ColorPicker,
            on, query, dom
            ){
            // create a layer first
            var layer = new ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");
            // once the layer loads, use its tile levels to label the map's slider
            layer.on("load", function() {
               // use layer's scales to display as slider labels
               var labels = [];
               var lods = layer.tileInfo.lods;
               for ( var i = 0, il = lods.length; i < il; i++ ) {
                  if ( i % 2 ) {
                     labels.push(number.format(lods[i].scale.toFixed()));
                  }
               }

               map = new Map("mapDiv", {
                  center: [0, 15],
                   zoom: 3,
                   autoResize: true,
                   displayGraphicsOnPan: true,
                   logo: false,
                   sliderStyle: "large",
                   sliderLabels: labels, 
                   scalebarStyle: "line",
                   sliderPosition: "bottom-left",
                   wrapAround180: true,
                   minZoom: 3,
                   maxZoom: 19,
                   basemap: "hybrid", //options: "streets" , "satellite" , "hybrid", "topo", "gray", "oceans", "national-geographic", "osm"
               });

               var scalebar = new Scalebar({
                  map: map,
                   // "dual" displays both miles and kilmometers
                   // "english" is the default, which displays miles
                   // use "metric" for kilometers
                   scalebarUnit: "dual"
               });

               map.on("load", mapLoaded);
            });


            function mapLoaded(){
               var points = [[19.82,41.33],[16.37,48.21],[18.38,43.85],[23.32,42.7],[16,45.8],[19.08,47.5],[12.48,41.9],[21.17,42.67],[21.43,42],[19.26,42.44],[26.1,44.43],[12.45,43.93],[20.47,44.82],[17.12,48.15],[14.51,46.06],[12.45,41.9]];
               var initColor = "#ce641d";
               arrayUtils.forEach(points, function(point) {
                  var graphic = new Graphic(new Point(point), createSymbol(markerpath, initColor));
                  map.graphics.add(graphic);
               });

               var colorPicker = new ColorPicker({}, "picker1");
               colorPicker.setColor(initColor);
               domStyle.set(colorPicker, "left", "500px");
               colorPicker.on("change", function(){
                  var colorCode = this.hexCode.value;
                  map.graphics.graphics.forEach(function(graphic){
                     graphic.setSymbol(createSymbol(markerpath, colorCode));
                  });
               });
            }

            function createSymbol(path, color){
               var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
               markerSymbol.setPath(path);
               markerSymbol.setColor(new dojo.Color(color));
               markerSymbol.setOutline(null);
               return markerSymbol;
            }
         });

   

   //Keyboard shortcuts/
   //source: http://stackoverflow.com/questions/9195814/google-maps-v3-keyboard-accessibility
   $('body').keydown(function(event) {
      if ($('#accordion').is(':focus')) {
         return;
      }

      if ($('#geocodeAddress').is(':focus')) {
         if (event.which == 13) {
            codeAddress();
         }
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
            refreshMaps(true);
            break;
         case 65: // a
            if (document.getElementById("autoRefresh") != null &&
                document.getElementById("autoRefresh").checked) {
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
            clearAllTracks();
            break;
         case 68: // d
            if (document.getElementById("distancetooltoggle") != null &&
                document.getElementById("distancetooltoggle").checked) {
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
            if (document.getElementById("enableCluster") != null &&
                document.getElementById("enableCluster").checked) {
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
            togglePanel();
            break;
         case 73: // i
            if (document.getElementById("IHSTabs") != null &&
                document.getElementById("IHSTabs").checked) {
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
            if (document.getElementById("Risk") != null &&
                document.getElementById("Risk").checked) {
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
            if (document.getElementById("LAISIC_TARGETS") != null &&
                document.getElementById("LAISIC_TARGETS").checked) {
               document.getElementById("LAISIC_TARGETS").checked = false;
               document.getElementById("LAISIC_TARGETS").removeAttribute("checked");
            }
            else {
               document.getElementById("LAISIC_TARGETS").checked = true;

               //Disable other type of views
               $('input[id=enabletimemachine]').attr('checked', false);
               toggleTimeMachine();
               disableCustomQuery();
            }
            clearAllTracks();
            refreshMaps(true);
            break;
         case 78: // n
            if (document.getElementById("showvesselnames") != null &&
                document.getElementById("showvesselnames").checked) {
               document.getElementById("showvesselnames").checked = false;
               document.getElementById("showvesselnames").removeAttribute("checked");
            }
            else {
               document.getElementById("showvesselnames").checked = true;
            }
            toggleShowNames();
            break;
         case 80: // p
            //Port layer
            if (document.getElementById("PortLayer") != null &&
                document.getElementById("PortLayer").checked) {
               document.getElementById("PortLayer").checked = false;
               document.getElementById("PortLayer").removeAttribute("checked");
            }
            else {
               document.getElementById("PortLayer").checked = true;
            }
            togglePortLayer();
            break;
         case 82: // r
            location.reload();
            break;
         case 84: // t
            if (trafficLayer == null) {
               trafficLayer = new google.maps.TrafficLayer();
               trafficLayer.setMap(map);
            }
            else {
               trafficLayer.setMap(null);
               trafficLayer = null;
            }
            break;
         case 87: // w
            //Weather layer
            if (document.getElementById("WeatherLayer") != null &&
                document.getElementById("WeatherLayer").checked) {
               document.getElementById("WeatherLayer").checked = false;
               document.getElementById("WeatherLayer").removeAttribute("checked");
            }
            else {
               document.getElementById("WeatherLayer").checked = true;
            }
            toggleWeatherLayer();
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
         case 109: // numpad -
         case 189: // -
            map.setZoom(map.getZoom()-1);
            break;
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

   //Trigger localStorage to indicate page refresh or new load
   localStorage.clear();
   localStorage.setItem('refresh',1);
}

/* -------------------------------------------------------------------------------- */
function togglePanel() {
   $( "#panel" ).toggle("slide", { direction: 'right' }, 180);
   //$( "#panel" ).effect('fade').dequeue().toggle("slide", { direction: 'right' }, 180);

   !panelhidden ? $( "#showpanel" ).html("<div class='arrow-left'></div>") : $( "#showpanel" ).html("<div class='arrow-right'></div>");
   panelhidden = !panelhidden;
   return false;
}
