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
 *  Global objects 
 */
WS_ADDRESS = '127.0.0.1';     //IP address of WebSocket server
WS_PORT = '2412';                //Port of WebSocket server

/* -------------------------------------------------------------------------------- */
/**
 * Starts on page load using jQuery $() operator
 **/
$(function startAlertClient() {
   setTimeout(function delayedStart() {
      console.log('Starting alert client now');
      alertClient();
   }, 2000);   //adjust this value for delayed amount
});

/**
 * Main alert client function
 **/
function alertClient() {
   "use strict";

   var DEBUG = false;

   // for better performance - to avoid searching in DOM
   var content = $('#content');
   var alertLabel = $('.alertLabel');
   var alertCountLabel = $('.alertCountLabel');
   var alertCountBadge = $('.alertCountLabel.badge');
   var processedCountLabel = $('.processedCountLabel');
   var user = userid;
   var receivedAlertRules = false;
   var alertRulesArray = [];
   var alertPolygon = new google.maps.Polygon({
            strokeWeight: 2,
            strokeColor: '#5555FF',
            strokeOpacity: 0.8,
            fillColor: '#5555FF',
            fillOpacity: 0.2,
            geodesic: true,
            clickable: false,
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
   var connection = new WebSocket('ws://' + WS_ADDRESS + ':' + WS_PORT);

   //==================== Opened connection to the server =========================
   connection.onopen = function () {
      //Connected to server success
      alertLabel.html('<b>Connected to alert server as user: </b>' + user);
      $('#alertStatusConnection').text('Connected');
      $('#alertStatusBubble').css('background','#66ff66');
      setTimeout(function() {
         $('#alertStatusConnection').fadeOut('slow');
      }, 3000);

      //Send response (username)
      connection.send(JSON.stringify({type:'username', data: user }));
   };

   //==================== Closed connection to server =============================
   connection.onclose = function () {
      console.log('Server is down');
      alertLabel.text('Server is down');
      $('#alertStatusConnection').fadeIn('fast');
      $('#alertStatusConnection').text('Not Connected');
      $('#alertStatusBubble').css('background','red');

      //if alerts have already been received (i.e. server restarted) then
      // remove old alerts and add the new ones.
      console.log('Removing old alert panels');
      //TODO: Set focus to be summary panel first to prevent funky behavior
      $('.alertPanel').remove();  //Remove all accordion alert titles
      $('[id^=alert_id]').remove(); //Remove all accordion alert panels
      receivedAlertRules = false;

      //Set count to zero
      updateTotalAlertCount();

      //try to reconnect every 3 seconds
      setTimeout(function() {
         console.log('Attempting to reconnect...');
         alertClient();
      }, 1000);
   };

   //==================== Incoming messages from the server =======================
   connection.onmessage = function (message) {
      // try to parse JSON message. Because we know that the server always returns
      // JSON this should work without any problem but we should make sure that
      // the massage is not chunked or otherwise damaged.
      try {
         var json = JSON.parse(message.data);
         if (DEBUG) {
            console.log('Message from alertServer:', json);
         }
      } catch (e) {
         if (DEBUG) {
            console.log('Alert server sent non-JSON formatted data: ', message.data);
         }
         return;
      }

      //---------------------- Server connection response received ----------------
      if (json.type === 'response') {
         var serverResponse = json.data;
         if (DEBUG) {
            console.log('Alert server accepted the connection: ', serverResponse);
         }
      }
      else if (json.type === 'resetRules') {
         if (DEBUG) {
            console.log('Resetting alert rules as signaled by alert server');
         }

         //Reset received alertRules
         receivedAlertRules = false;
         if (DEBUG) {
            console.log('Removing old alert panels');
         }
         //TODO: Set focus to be summary panel first to prevent funky behavior
         $('.alertPanel').remove();  //Remove all accordion alert titles
         $('[id^=alert_id]').remove(); //Remove all accordion alert panels

         alertRulesArray = [];
      }
      //---------------------- Alert Rule received -------------------------------
      else if (json.type === 'alertRule') {
         //Set received alertRules to true now that we are receiving the alerts
         receivedAlertRules = true;

         //Create a new menu panel content for the alert accordion panel
         var singleAlertRule = json.data;
         if (DEBUG) {
            console.log('Received alert:', singleAlertRule.alert_id);
         }

         //store alert rule to array
         alertRulesArray.push(singleAlertRule);

         //Create the accordion panel with new received rule
         createAccordionElement(singleAlertRule);
      }
      //---------------------- Alert received -------------------------------------
      else if (json.type === 'alertNotification') {
         var decodedAIS = JSON.parse(json.data);
         var vessel = JSON.parse(json.vessel);
         var timestamp = parseInt(json.timestamp);

         if (DEBUG) {
            console.log('Alert server sent alert');
         }

         //Display the data in the specific alert accordion panel
         var matchingAlertRule = json.alertRule;   //alertRule that matched notification

         //Add notification to appropriate places
         newAlertReceived(matchingAlertRule, decodedAIS, vessel, timestamp);
      }
      //---------------------- Alert History --------------------------------------
      else if (json.type === 'alertHistory') {
         //TODO
      }
      //---------------------- Progress received ----------------------------------
      else if (json.type === 'totalDecoded') {
         if (DEBUG) {
            console.log('Alert server sent progress report');
         }
         //content.prepend(json.data + '<br>');
         processedCountLabel.html(json.data);
      }
      //---------------------- Alert History --------------------------------------
      else if (json.type === 'readcountreset') {
         //reset count on a certain id
         var id = parseInt(json.data);

         if (DEBUG) {
            console.log('Alert count was reset on alert', id);
         }

         fetchAlertsArchiveCount(id);
      }
      //---------------------- Unknown message received ---------------------------
      else {
         if (DEBUG) {
            console.log('Alert server sent unrecognized data', json);
         }
      }
   };

   /* -------------------------------------------------------------------------------- */
   /**
    * Creates a new panel in the alert accordion with a new alert rule received
    **/
   function createAccordionElement(singleAlertRule) {
      var id = singleAlertRule.alert_id;

      //Create the accordion panel title
      var accordionElement = document.createElement('h3');
      accordionElement.className = 'alertPanel';
      accordionElement.id = 'alert_heading_id' + id;
      accordionElement.innerHTML = 'Alert ' + id + ' for ' + singleAlertRule.user_id + ' (<span id="alertCount-' + id + '">0</span>)';
      //Create the accordion panel content
      var alertDiv = document.createElement('div');
      alertDiv.id = 'alert_id' + id;

      //Add the new accordion panel and refresh the accordion
      $("#alertAccordion").append(accordionElement).append(alertDiv).accordion('destroy').accordion();

      //Add polygon checkbox
      $('<input />', {type: 'checkbox', id: 'polygon_alert_id'+id, value: 'Show alert polygon' }).appendTo($('#alert_id' + id));
      $('#alert_id' + id).append('Show Polygon');

      $('#alert_id' + id).append($('<br />'));

      //Mark as read button
      $('<input />', {type: 'button', id: 'markasread_id'+id, value: 'Mark As Read' }).appendTo($('#alert_id' + id));
      $('#alert_id' + id).append('<br>');

      //Zoom to polygon button
      $('<input />', {type: 'button', id: 'show_polygon_id'+id, value: 'Zoom to Polygon' }).appendTo($('#alert_id' + id));
      $('#alert_id' + id).append('<br>');

      //Edit alert button
      $('<input />', {type: 'button', id: 'edit_alert_button'+id, value: 'Edit Alert' }).appendTo($('#alert_id' + id));
      //Delete alert button
      $('<input />', {type: 'button', id: 'delete_alert_button'+id, value: 'Delete Alert' }).appendTo($('#alert_id' + id));

      //Pretty print the alert rules/properties
      var panelContent = document.getElementById('alert_id' + id);

      panelContent.appendChild(document.createElement('fieldset')).innerHTML = '<legend><b>Alert Rules</b></legend><pre><div id="alertRule-'+id+'">' + JSON.stringify(singleAlertRule, undefined, 1) + '</div></pre>'; 


      //Pretty print latest matching AIS message
      panelContent.appendChild(document.createElement('fieldset')).innerHTML = '<legend><b>Matching AIS messages</b></legend><pre><div id="alertNewMessages-'+id+'"></div></pre>'; 


      //Handle button/checkbox clicks
      $('#polygon_alert_id' + id).click(function () {
         if (DEBUG) {
            console.log('Show alert polygon toggled');
         }
         if (this.checked) {
            showPolygon(id);
         }
         else {
            hidePolygon();
         }
      });

      $('#markasread_id' + id).click(function () {
         markAsRead(id);
      });

      $('#show_polygon_id' + id).click(function () {
         if (DEBUG) {
            console.log('Zooming into polygon ' + id);
         }
         zoomToPolygon(id);
      });

      $('#edit_alert_button' + id).click(function () {
         alert('Edit alert not yet implemented');
      });

      $('#delete_alert_button' + id).click(function () {
         if (DEBUG) {
            console.log('Deleting alert ' + id);
         }

         hidePolygon();
         $('#alertSummaryheading').click();

         //TODO: call PHP to delete from database
         deleteAlertFromDB(id);
      });

      $('#alertRule-' + id).css('cursor', 'pointer');
      $('#alertRule-' + id).click(function () {
         if (DEBUG) {
            console.log('Zooming into polygon ' + id);
         }
         zoomToPolygon(id);
      });

      //Fetch missed alerts from archive and populate rule
      //fetchAlertsArchive(id);
      fetchAlertsArchiveCount(id);
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * Perform appropriate actions after receiving an alert with a matching alertRule
    **/
   function newAlertReceived(matchingAlertRule, decodedAIS, vessel, timestamp) {
      //var panelContent = document.getElementById('alert_id' + matchingAlertRule.alert_id);
      var divNewMessages = document.getElementById('alertNewMessages-' + matchingAlertRule.alert_id);

      if (typeof divNewMessages === 'undefined') {
         if (DEBUG) {
            console.log('newAlertReceived(): ERROR - accordion element for received alert does not exist');
         }
         return;
      }

      //console.log(timestamp);

      //panelContent.appendChild(document.createElement('pre')).innerHTML = toHumanTime(timestamp) + ' UTC';
      //panelContent.appendChild(document.createElement('pre')).innerHTML = JSON.stringify(decodedAIS, undefined, 1);
      divNewMessages.innerHTML = toHumanTime(timestamp) + '<br>' + JSON.stringify(vessel, undefined, 1) + '<br>' + JSON.stringify(decodedAIS, undefined, 1);

      //increment count on alert panel title
      var alertCountSpan = document.getElementById('alertCount-' + matchingAlertRule.alert_id);
      alertCountSpan.innerHTML = parseInt(alertCountSpan.innerHTML) + 1;

      //display Growl notification
      //console.log(decodedAIS);

      updateTotalAlertCount();

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
         //shapeFadeOut(alertVesselCircle, 2, null);     //GPU intensive to fade many alert circles
         alertVesselCircle.setMap(null);
      }, 3000);

      //Handle click
      //TODO: Need to remove click listener if the message is overwritten!
      $('#alertNewMessages-' + matchingAlertRule.alert_id).unbind( "click" );

      $('#alertNewMessages-' + matchingAlertRule.alert_id).unbind( "mouseenter" );      
      $('#alertNewMessages-' + matchingAlertRule.alert_id).unbind( "mouseleave" );      

      var alertVesselTempCircle = new google.maps.Circle({
          center:         new google.maps.LatLng(decodedAIS.lat,decodedAIS.lon),
          radius:         500,
          strokeColor:    '#FF0000',
          strokeOpacity:  1.0,
          strokeWeight:   1,
          fillColor:      '#FF0000',
          fillOpacity:    0.7,
      });

      $('#alertNewMessages-' + matchingAlertRule.alert_id).css('cursor', 'pointer')
      //Handle hover action
      .mouseenter(function () {
         alertVesselTempCircle.setMap(map);
      })
      .mouseleave(function() {
         alertVesselTempCircle.setMap(null);
      })
      //Handle click action
      .click(function () {
         google.maps.Map.prototype.setCenterWithOffset = function(latlng, offsetX, offsetY) {
            var map = this;
            var ov = new google.maps.OverlayView();
            ov.onAdd = function() {
               var proj = this.getProjection();
               var aPoint = proj.fromLatLngToContainerPixel(latlng);
               aPoint.x = aPoint.x+offsetX;
               aPoint.y = aPoint.y+offsetY;
               map.setCenter(proj.fromContainerPixelToLatLng(aPoint));
            }; 
            ov.draw = function() {}; 
            ov.setMap(this); 
         };

         map.setCenterWithOffset(new google.maps.LatLng(decodedAIS.lat,decodedAIS.lon), 0, -100);

         setTimeout(function() {
            selectVessel(decodedAIS.mmsi);
         }, 1000);
      });
   }

/* -------------------------------------------------------------------------------- */
   /**
    * Perform appropriate actions after receiving an alert with a matching alertRule
    **/
   function alertCountReceived(id, count) {
      //increment count on alert panel title
      var alertCountSpan = document.getElementById('alertCount-' + id);

      if (typeof alertCountSpan === 'undefined') {
         if (DEBUG) {
            console.log('newAlertReceived(): ERROR - accordion element for received alert id ' + id + ' does not exist');
         }
         return;
      }

      alertCountSpan.innerHTML = count;
      //alertCountSpan.innerHTML = parseInt(alertCountSpan.innerHTML) + count;

      updateTotalAlertCount();
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Display the alert polygon based on alert id
   **/
   function showPolygon(id) {
      if (DEBUG) {
         console.log('Displaying alert polygon for id', id);
      }
      
      //Parse polygon
      //find the right polygon

      var polygonVertices = parsePolyStrings(alertRulesArray[alertArrayIndexByID(id)].polygon);

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
   * Zoom to the alert polygon based on alert id
   **/
   function zoomToPolygon(id) {
      if (DEBUG) {
         console.log('Zooming to alert polygon for id', id);
      }

      //Draw the polygon on the map
      //map.setCenter(alertPolygon.getCenter());
      var polygonBounds = alertPolygon.getBounds();
      map.fitBounds(polygonBounds);
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
      var humanTime = date.toLocaleString("en-US",{timeZone: "UTC"}) + ' UTC';
      return humanTime;
   }

   google.maps.Polygon.prototype.getBounds = function() {
      var bounds = new google.maps.LatLngBounds();
      var paths = this.getPaths();
      var path;        
      for (var i = 0; i < paths.getLength(); i++) {
         path = paths.getAt(i);
         for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
         }
      }
      return bounds;
   }
  
   /* -------------------------------------------------------------------------------- */
   function setCountBubbleColor(alertSum) {
      if (alertSum > 0) {
         //$('#alertsCountBubble').css('background-color', 'red');
         alertCountBadge.addClass('progress-bar-danger');
      }
      else {
         //$('#alertsCountBubble').css('background-color', 'gray');
         alertCountBadge.removeClass('progress-bar-danger');
      }
   }

   /* -------------------------------------------------------------------------------- */
   function deleteAlertFromDB(id) {
      var phpWithArg = 'query_alert_delete.php?alertid=' + id;

      if (DEBUG) {
         console.log(phpWithArg);      
      }

      //Call the PHP script to insert new alert row to alert database
      if (DEBUG) {
         console.log('Calling PHP script to push new alert_properties element...');
      }
      $.getJSON(
            phpWithArg, 
            function (){ 
               if (DEBUG) {
                  console.log('deleteAlertFromDB(): Success on deleting alert');
               }
            }
            )
         .done(function (response) {
            //console.log('saveAlert(): ' + response.query);

            if (DEBUG) {
               console.log('deleteAlertFromDB(): Deleted alert id ' + response.alert_id);
            }

            //TODO: Add criteria to database here

            //TODO: notify server about newly added alert so that it can be added for monitoring
            var connection = new WebSocket('ws://' + WS_ADDRESS + ':' + WS_PORT);

            //==================== Opened connection to the server =========================
            connection.onopen = function () {
               //Connected to server success

               //TODO: send message to server of deleted alert id
               connection.send(JSON.stringify({type:'deletealert', data: id }));         

               //TODO: listen for success response from server
               connection.close();
            };

            //Send visual alert of deletion success
            alert('Alert ' + id + ' successfully deleted.');
         }) // END .done()
      .fail(function() {
         if (DEBUG) {
            console.log('deleteAlertFromDB(): ' +  'No response from alert database; error in php?'); 
         }

         //alert('Alert not saved.  Please try again');

         return;
      }); //END .fail()
   }

   /* -------------------------------------------------------------------------------- */
   function markAsRead(id) {
      var phpWithArg = 'query_alert_archive_mark_read.php?alertid=' + id;

      if (DEBUG) {
         console.log(phpWithArg);      
      }

      //Call the PHP script to insert new alert row to alert database
      if (DEBUG) {
         console.log('Calling PHP script to mark archived messages as read...');
      }
      $.getJSON(
            phpWithArg, 
            function (){ 
               if (DEBUG) {
                  console.log('markAsRead(): Success on marking as read');
               }

               //Notify all clients (via server's relay) that count was reset on this id
               connection.send(JSON.stringify({type:'readcountreset', data: id }));
            }
            )
         .done(function (response) {
            //console.log('saveAlert(): ' + response.query);
            if (DEBUG) {
               console.log('markAsRead(): Alert id ' + response.alert_id + ' marked as read.');
            }

            //TODO: reset GUI alert count
            var countSpan = $('#alertCount-'+id);
            countSpan.text('0');

            updateTotalAlertCount();
         }) // END .done()
      .fail(function() {
         if (DEBUG) {
            console.log('markAsRead(): ' +  'No response from alert database; error in php?'); 
         }

         //alert('Alert not saved.  Please try again');

         return;
      }); //END .fail()
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Returns the element index number given an alert ID
   **/
   function alertArrayIndexByID(id) {
      for (var i=0; i < alertRulesArray.length; i++) {
         if (alertRulesArray[i].alert_id == id) {
            return i;
         }
      };
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Fetches missed alerts and sets them to read (only on click TODO)
   **/
   function fetchAlertsArchive(id) {
      var phpWithArg = 'query_alert_archive.php?alertid=' + id;

      if (DEBUG) {
         console.log(phpWithArg);      
      }

      //Call the PHP script to insert new alert row to alert database
      if (DEBUG) {
         console.log('Calling PHP script to fetch alert archive...');
      }
      $.getJSON(
            phpWithArg, 
            function (){ 
               if (DEBUG) {
                  console.log('fetchAlertsArchive(): Success on fetching archive for alert');
               }
            }
            )
         .done(function (response) {
            if (DEBUG) {
               console.log(response);
            }

            $.each(response.alert_array, function(key, alertRow) {
               newAlertReceived(alertRulesArray[alertArrayIndexByID(id)], JSON.parse(alertRow.aisdata), JSON.parse(alertRow.vesseldata), alertRow.timestamp);
            });

            if (DEBUG) {
               console.log('fetchAlertsArchive(): Fetched archive for alert id ' + response.alert_id);
            }
         }) // END .done()
      .fail(function() {
         if (DEBUG) {
            console.log('fetchAlertsArchive(): ' +  'No response from alert database; error in php?'); 
         }

         //alert('Alert not saved.  Please try again');

         return;
      }); //END .fail()
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Fetches ONLY COUNT of missed alerts for quick status retrieval
   **/
   function fetchAlertsArchiveCount(id) {
      //Get count only, so add a flag to indicate it
      var phpWithArg = 'query_alert_archive.php?alertid=' + id + '&countOnly=1';

      if (DEBUG) {
         console.log(phpWithArg);      
      }

      //Call the PHP script to insert new alert row to alert database
      if (DEBUG) {
         console.log('Calling PHP script to fetch alert archive count...');
      }
      $.getJSON(
            phpWithArg, 
            function (){ 
               if (DEBUG) {
                  console.log('fetchAlertsArchiveCount(): Success on fetching archive count for alert');
               }
            }
            )
         .done(function (response) {
            if (DEBUG) {
               console.log(response);
            }

            var count = JSON.parse(response.count);

            alertCountReceived(id, count);

            if (DEBUG) {
               console.log('fetchAlertsArchiveCount(): Fetched archive count for alert id ' + response.alert_id);
            }

            return count;
         }) // END .done()
      .fail(function() {
         if (DEBUG) {
            console.log('fetchAlertsArchiveCount(): ' +  'No response from alert database; error in php?'); 
         }

         //alert('Alert not saved.  Please try again');

         return null;
      }); //END .fail()
   }

   /* -------------------------------------------------------------------------------- */
   /**
   * Updates the total count sum displayed
   **/
   function updateTotalAlertCount() {
      //Sum up the counts in the accordion heading spans
      var alertCountSpans = $("[id^='alertCount-']");
      var alertSum = 0;

      if (typeof alertCountSpans != 'undefined') {
         alertCountSpans.each(function(index) {
            alertSum += parseInt(this.innerHTML);
         });
      }

      alertCountLabel.text(alertSum);
      setCountBubbleColor(alertSum);
   }
}

/* -------------------------------------------------------------------------------- */
function toggleAlertsPanel() {
   $('#alertPanel').toggle();

   if ($('#alertPanel:visible').length !== 0) {
      //Panel is shown

      //If alertPanel is visible
      if ($("#alertAccordion").accordion != undefined) {
         $("#alertAccordion").accordion("refresh");
      }

      //highlight the nav button with color
      if ($('#alerts_nav').length !== 0) {
         $('#alerts_nav').css('background-color', 'rgb(100, 100, 100)');
      }
   }
   else {
      //Panel got hidden

      //reset the nav button color
      $('#alerts_nav').css('background-color', '');
   }
}
