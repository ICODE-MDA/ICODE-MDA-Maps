/**
 * @name alertclient.js
 * @author Sparta Cheung
 * @fileoverview
 * Client to receive alerts from alerts server through a WebSocket connection.
 * Displays alerts in a JQueryUI accordion style view and manipulates Google Map API
 * elements on the map.
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
         //Received an alert that the server retrieved from the database
         //if alerts have already been received (i.e. server restarted) then
         // remove old alerts and add the new ones.
         if (receivedAlertRules) {
            //TODO: remove old alerts to add the new ones
         }

         //Set received alertRules to true now that we are receiving the alerts
         receivedAlertRules = true;

         //Create a new menu element content for the alert accordion element
         var singleAlert = json.data;
         console.log('Received alert:', singleAlert.alert_id);

         //store alert rule to array
         alertArray.push(singleAlert);

         //Create the accordion element with new received rule
         createAccordionElement(singleAlert);
      }
      //---------------------- Alert received -------------------------------------
      else if (json.type === 'alertNotification') {
         var decodedAIS = JSON.parse(json.data);

         console.log('Alert server sent alert');

         //Display the data in the specific alert accordion element
         var singleAlert = json.alertRule;

         //Add notification to appropriate places
         newAlertReceived(singleAlert, decodedAIS);
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
    * Creates a new element in the alert accordion with a new alert rule received
    **/
   function createAccordionElement(singleAlert) {
      //Create the accordion element title
      var accordionElement = document.createElement('h3');
      accordionElement.innerHTML = 'Alert ' + singleAlert.alert_id + ' for ' + singleAlert.user_id + ' (<span id="alertCount-' + singleAlert.alert_id + '">0</span>)';
      //Create the accordion element content
      var alertDiv = document.createElement('div');
      alertDiv.id = 'alert_id' + singleAlert.alert_id;

      //Add the new accordion element and refresh the accordion
      $("#alertAccordion").append(accordionElement).append(alertDiv).accordion('destroy').accordion();

      //Pretty print the alert rules/properties
      var elementContent = document.getElementById('alert_id' + singleAlert.alert_id);
      elementContent.innerHTML += '<b>Alert rules:</b><br>';
      elementContent.appendChild(document.createElement('pre')).innerHTML = JSON.stringify(singleAlert, undefined, 1);
      elementContent.innerHTML += '<hr><br>';
      elementContent.innerHTML += '<b>Matching AIS messages:</b><br>';
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * Perform appropriate actions after receiving an alert with a matching alertRule
    **/
   function newAlertReceived(singleAlert, decodedAIS) {
      var elementContent = document.getElementById('alert_id' + singleAlert.alert_id);
      elementContent.appendChild(document.createElement('pre')).innerHTML = JSON.stringify(decodedAIS, undefined, 1);

      //increment count on alert element title
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

   /*
   //Handle accordion clicking events
   $("#alertAccordion").on("accordionactivate", function(event, ui) {
   console.log('Accordion clicked', ui.newPanel);
   });
   */
});
