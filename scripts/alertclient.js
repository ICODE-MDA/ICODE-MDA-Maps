/**
 * @name alertclient.js
 * @author Sparta Cheung
 * @fileoverview
 * Client to receive alerts from alerts server through a WebSocket connection.
 * Displays alerts in a JQueryUI accordion style view and manipulates Google Map API
 * panels on the map.
 */

/* -------------------------------------------------------------------------------- */
/**
 * Main alert client function
 **/
$(function start() {
   "use strict";

   toastr.options = {
      "closeButton": false,
      "debug": false,
      "positionClass": "toast-bottom-right",
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
   }

   // for better performance - to avoid searching in DOM
   var content = $('#content');
   var alertLabel = $('#alertLabel');
   var alertCountLabel = $('#alertCountLabel');
   var processedCountLabel = $('#processedCountLabel');
   var user = 'icodeuser';
   var receivedAlertRules = false;
   var alertCountTotal = 0;
   var alertArray = [];
   var alertPolygon = new google.maps.Polygon({
            strokeWeight: 2,
            strokeColor: '#5555FF',
            strokeOpacity: 0.8,
            fillColor: '#5555FF',
            fillOpacity: 0.2,
            geodesic: true,
            map: null
         });

   //if user is running Mozilla then use its built-in WebSocket
   window.WebSocket = window.WebSocket || window.MozWebSocket;

   //if browser doesn't support WebSocket, just show some notification and exit
   if (!window.WebSocket) {
      content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
         + 'support WebSockets.'} ));
         $('span').hide();
      return;
   }

   //Open socket connection to server
   var connection = new WebSocket('ws://128.49.78.214:2411');

   //==================== Opened connection to the server =========================
   connection.onopen = function () {
      //Connected to server success
      alertLabel.html('<b>Connected to alert server as user: </b>' + user);
      connection.send(user);
   };

   //==================== Closed connection to server =============================
   connection.onclose = function () {
      console.log('Server is down');
      alertLabel.text('Server is down');

      //if alerts have already been received (i.e. server restarted) then
      // remove old alerts and add the new ones.
      console.log('Removing old alert panels');
      //TODO: Set focus to be summary panel first to prevent funky behavior
      $('.alertPanel').remove();  //Remove all accordion alert titles
      $('[id^=alert_id]').remove(); //Remove all accordion alert panels
      receivedAlertRules = false;


      //try to reconnect every 3 seconds
      setTimeout(function() {
         console.log('Attempting to reconnect...');
         start();
      }, 1000);
   };

   //==================== Incoming messages from the server =======================
   connection.onmessage = function (message) {
      // try to parse JSON message. Because we know that the server always returns
      // JSON this should work without any problem but we should make sure that
      // the massage is not chunked or otherwise damaged.
      try {
         var json = JSON.parse(message.data);
      } catch (e) {
         console.log('Alert server sent non-JSON formatted data: ', message.data);
         return;
      }

      //---------------------- Server connection response received ----------------
      if (json.type === 'response') {
         var serverResponse = json.data;
         console.log('Alert server accepted the connection: ', serverResponse);
      }
      //---------------------- Alert Rules received -------------------------------
      else if (json.type === 'alertRules') {
         //Set received alertRules to true now that we are receiving the alerts
         receivedAlertRules = true;

         //Create a new menu panel content for the alert accordion panel
         var singleAlert = json.data;
         console.log('Received alert:', singleAlert.alert_id);

         //store alert rule to array
         alertArray.push(singleAlert);

         //Create the accordion panel with new received rule
         createAccordionElement(singleAlert);
      }
      //---------------------- Alert received -------------------------------------
      else if (json.type === 'alertNotification') {
         var decodedAIS = JSON.parse(json.data);
         var timestamp = parseInt(json.timestamp);

         console.log('Alert server sent alert');

         //Display the data in the specific alert accordion panel
         var singleAlert = json.alertRule;

         //Add notification to appropriate places
         newAlertReceived(singleAlert, decodedAIS, timestamp);
      }
      //---------------------- Alert History --------------------------------------
      else if (json.type === 'alertHistory') {
         //TODO
      }
      //---------------------- Progress received ----------------------------------
      else if (json.type === 'totalDecoded') {
         console.log('Alert server sent progress report');
         //content.prepend(json.data + '<br>');
         //toastr.info(json.data)
         processedCountLabel.html(json.data);
      }
      //---------------------- Unknown message received ---------------------------
      else {
         console.log('Alert server sent unrecognized data', json);
         toastr.error('Unrecognized data received: ', json);
      }
   };

   /* -------------------------------------------------------------------------------- */
   /**
    * Creates a new panel in the alert accordion with a new alert rule received
    **/
   function createAccordionElement(singleAlert) {
      var id = singleAlert.alert_id;

      //Create the accordion panel title
      var accordionElement = document.createElement('h3');
      accordionElement.className = 'alertPanel';
      accordionElement.innerHTML = 'Alert ' + id + ' for ' + singleAlert.user_id + ' (<span id="alertCount-' + id + '">0</span>)';
      //Create the accordion panel content
      var alertDiv = document.createElement('div');
      alertDiv.id = 'alert_id' + id;

      //Add the new accordion panel and refresh the accordion
      $("#alertAccordion").append(accordionElement).append(alertDiv).accordion('destroy').accordion();

      //Add polygon checkbox
      $('<input />', {type: 'checkbox', id: 'polygon_alert_id'+id, value: 'Show alert polygon' }).appendTo($('#alert_id' + id));
      $('#alert_id' + id).append('Show Polygon');

      //Pretty print the alert rules/properties
      var panelContent = document.getElementById('alert_id' + id);

      panelContent.appendChild(document.createElement('fieldset')).innerHTML = '<legend><b>Alert Rules</b></legend><pre>' + JSON.stringify(singleAlert, undefined, 1) + '</pre'; 

      //panelContent.innerHTML += '<p><b>Alert rules:</b><br>';
      //panelContent.appendChild(document.createElement('pre')).innerHTML = JSON.stringify(singleAlert, undefined, 1);
      panelContent.innerHTML += '<br>';
      panelContent.innerHTML += '<b>Matching AIS messages:</b><br>';

      var divNewMessages = document.createElement('div');
      divNewMessages.setAttribute('id', 'alertNewMessages-'+id);
      var divNewMessagesContent = document.createTextNode('New alerts displayed here.');
      divNewMessages.appendChild(divNewMessagesContent);

      panelContent.appendChild(divNewMessages);


      $('#polygon_alert_id' + id).click(function () {
         console.log('Show alert polygon toggled');
         if (this.checked) {
            showPolygon(id);
         }
         else {
            hidePolygon(id);
         }
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * Perform appropriate actions after receiving an alert with a matching alertRule
    **/
   function newAlertReceived(singleAlert, decodedAIS, timestamp) {
      //var panelContent = document.getElementById('alert_id' + singleAlert.alert_id);
      var divNewMessages = document.getElementById('alertNewMessages-' + singleAlert.alert_id);

      console.log(timestamp);
      //panelContent.appendChild(document.createElement('pre')).innerHTML = toHumanTime(timestamp) + ' UTC';
      //panelContent.appendChild(document.createElement('pre')).innerHTML = JSON.stringify(decodedAIS, undefined, 1);
      divNewMessages.innerHTML = JSON.stringify(decodedAIS, undefined, 1);

      //increment count on alert panel title
      var alertCountSpan = document.getElementById('alertCount-' + singleAlert.alert_id);
      alertCountSpan.innerHTML = parseInt(alertCountSpan.innerHTML) + 1;

      //display Growl notification
      toastr.success(decodedAIS.mmsi + ' detected in ROI!');
      console.log(decodedAIS);

      alertCountTotal++;
      alertCountLabel.text(alertCountTotal);

      //Draw an indicator on the map where the alert vessel originated from
      var alertVesselCircle = new google.maps.Circle({
         center:         new google.maps.LatLng(decodedAIS.lat,decodedAIS.lon),
         radius:         2000,
         strokeColor:    '#FF0000',
         strokeOpacity:  1.0,
         strokeWeight:   1,
         fillColor:      '#FF0000',
         fillOpacity:    0.7,
         map:            map
      });

      setTimeout(function () {
         shapeFadeOut(alertVesselCircle, 2, null);
      }, 3000);
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Display the alert polygon based on alert id
   **/
   function showPolygon(id) {
      console.log('Displaying alert polygon for id', id);
      //console.log(alertArray[id-1].polygon);
      
      //Parse polygon
      var polygonVertices = parsePolyStrings(alertArray[id-1].polygon);

      //Draw the polygon on the map
      if (polygonVertices.length) {
         alertPolygon.setPaths(polygonVertices);
         alertPolygon.setMap(map);
      }
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Hide the alert polygon from the map
   **/
   function hidePolygon() {
      alertPolygon.setMap(null);
   }

   //Function from http://stackoverflow.com/questions/16482303/convert-well-known-text-wkt-from-mysql-to-google-maps-polygons-with-php
   function parsePolyStrings(ps) {
      var i, j, lat, lng, tmp, tmpArr,
      arr = [],
      //match '(' and ')' plus contents between them which contain anything other than '(' or ')'
      m = ps.match(/\([^\(\)]+\)/g);
      if (m !== null) {
         for (i = 0; i < m.length; i++) {
            //match all numeric strings
            tmp = m[i].match(/-?\d+\.?\d*/g);
            if (tmp !== null) {
               //convert all the coordinate sets in tmp from strings to Numbers and convert to LatLng objects
               for (j = 0, tmpArr = []; j < tmp.length; j+=2) {
                  lat = Number(tmp[j + 1]);
                  lng = Number(tmp[j]);
                  tmpArr.push(new google.maps.LatLng(lat, lng));
               }
               arr.push(tmpArr);
            }
         }
      }
      //array of arrays of LatLng objects, or empty array
      return arr;
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Function to fade a Google Maps API shape object off the map
   **/
   function shapeFadeOut(shape, seconds, callback){
      var fill = 50/(seconds*999);
      var stroke = 50/(seconds*999);
      var fadeOut = setInterval(function(){
         if((shape.get("strokeOpacity") < 0.0) && (shape.get("fillOpacity") < 0.0)){
            clearInterval(fadeOut);
            shape.setMap(null);
            if(typeof(callback) == 'function')
               callback();
            return;
         }
         shape.setOptions({
            'fillOpacity': Math.max(0.0, shape.fillOpacity-fill),
            'strokeOpacity': Math.max(0.0, shape.strokeOpacity-stroke)
         });
      }, 50);
   }   

   //Handle accordion clicking events
   $("#alertAccordion").on("accordionactivate", function(event, ui) {
      //uncheck all "Show Polygon" checkboxes, then hide the previous polygon
      $("#alertAccordion").find('[id^=polygon_alert_id]').prop('checked', false)
      hidePolygon();

      //Find the checkbox for the polygon in the current focused panel and check it, 
      //assuming it is unchecked to begin with
      var accordionPanel = ui.newPanel;
      accordionPanel.find('[id^=polygon_alert_id]').trigger( "click" );
   });


   /* -------------------------------------------------------------------------------- */
   function toHumanTime(unixtime) {
      var date = new Date(unixtime * 1000);
      var humanTime = date.toLocaleString("en-US",{timeZone: "UTC"});
      return humanTime;
   }
});
