//Code below from https://developers.google.com/maps/documentation/javascript/examples/layer-data-dragndrop
var geojsonfeatures;

//Listen for map to load, then initialize dragdrop functionality
google.maps.event.addDomListener(window, 'load', function() {
   initEvents();
});

function loadGeoJsonString(geoString) {
   var geojson = JSON.parse(geoString);

   if (typeof geojsonfeatures !== 'undefined') {
      console.log('Removing previous layer');
      for (var i = 0; i < geojsonfeatures.length; i++) {
         map.data.remove(geojsonfeatures[i]);
      }
   }

   geojsonfeatures = map.data.addGeoJson(geojson);

   // Add some style.
   map.data.setStyle(function(feature) {
      return /** @type {google.maps.Data.StyleOptions} */({
         fillColor: feature.getProperty('color'),
         strokeWeight: 1
      });
   });

   zoom(map);
}

/**
* Update a map's viewport to fit each geometry in a dataset
* @param {google.maps.Map} map The map to adjust
*/
function zoom(map) {
   var bounds = new google.maps.LatLngBounds();
   map.data.forEach(function(feature) {
      processPoints(feature.getGeometry(), bounds.extend, bounds);
   });
   map.fitBounds(bounds);
}

/**
* Process each point in a Geometry, regardless of how deep the points may lie.
* @param {google.maps.Data.Geometry} geometry The structure to process
* @param {function(google.maps.LatLng)} callback A function to call on each
*     LatLng point encountered (e.g. Array.push)
* @param {Object} thisArg The value of 'this' as provided to 'callback' (e.g.
*     myArray)
*/
function processPoints(geometry, callback, thisArg) {
   if (geometry instanceof google.maps.LatLng) {
      callback.call(thisArg, geometry);
   } else if (geometry instanceof google.maps.Data.Point) {
      callback.call(thisArg, geometry.get());
   } else {
      geometry.getArray().forEach(function(g) {
         processPoints(g, callback, thisArg);
      });
   }
}

function initEvents() {
   // set up the drag & drop events
   var mapContainer = document.getElementById('map_canvas');
   var dropContainer = document.getElementById('drop-container');

   // first on common events
   [mapContainer, dropContainer].forEach(function(container) {
      container.addEventListener('drop', handleDrop, false);
      container.addEventListener('dragover', showPanel, false);
   });

   // then map-specific events
   mapContainer.addEventListener('dragstart', showPanel, false);
   mapContainer.addEventListener('dragenter', showPanel, false);

   // then the overlay specific events (since it only appears once drag starts)
   dropContainer.addEventListener('dragend', hidePanel, false);
   dropContainer.addEventListener('dragleave', hidePanel, false);
}

function showPanel(e) {
   e.stopPropagation();
   e.preventDefault();
   document.getElementById('drop-container').style.display = 'block';
   return false;
}

function hidePanel(e) {
   document.getElementById('drop-container').style.display = 'none';
}

function handleDrop(e) {
   e.preventDefault();
   e.stopPropagation();
   hidePanel(e);

   var files = e.dataTransfer.files;

   if (files.length) {
      // process file(s) being dropped
      // grab the file data from each file
      for (var i = 0, file; file = files[i]; i++) {
         var reader = new FileReader();
         var filetype = file.type;

         reader.onload = function(e) {
            //Check if KML file
            var geojsonplaintext;
            if (filetype === 'application/vnd.google-earth.kml+xml') {
               parser=new DOMParser();
               xmlDoc=parser.parseFromString(e.target.result,"text/xml");
               geojsonplaintext = toGeoJSON.kml(xmlDoc);
               loadGeoJsonString(JSON.stringify(geojsonplaintext));
            }
            else {
               loadGeoJsonString(e.target.result);
            }
         };
         reader.onerror = function(e) {
            console.error('reading failed');
         };
         reader.readAsText(file);
      }
   } 
   else {
      // process non-file (e.g. text or html) content being dropped
      // grab the plain text version of the data
      var plainText = e.dataTransfer.getData('text/plain');

      //Load GeoJSON data
      if (plainText) {
         //Plaintext could either be geoJSON format, or plaintext with [lat lon]
         if (plainText.indexOf('{') == 0) {
            console.log('Dragged in geoJSON plaintext');
            //Example plaintext to try: https://storage.googleapis.com/maps-devrel/google.json
            //https://developers.google.com/maps/documentation/javascript/examples/layer-data-dragndrop
            loadGeoJsonString(plainText);
         }
         else {
            console.log('Dragged in plaintext with rows of "lat lon"');

            var geojsonFeature = {
               "type": "FeatureCollection",
               "features": [ ]
            };

            console.log(plainText);

            var coordArray = plainText.split('\n');

            coordArray.forEach(function(entry) {
               var latlonarray = entry.split('\t');

               geojsonFeature.features.push({
                  "type": "Feature",
                  "id": 0,
                  "geometry": {
                     "type": "Point",
                     "color": "#ff0000",
                     "coordinates": [  //lon, lat
                        parseFloat(latlonarray[1]),
                        parseFloat(latlonarray[0])
                        ]
                  }
               });
            });
            

            loadGeoJsonString(JSON.stringify(geojsonFeature));
         }
      }
   }

   // prevent drag event from bubbling further
   return false;
}
