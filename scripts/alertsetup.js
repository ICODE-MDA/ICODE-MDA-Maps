/**
 * @name Setup Alerts
 * @author Sparta Cheung, Bryan Bagnall
 * @fileoverview
 * Script to handle setting up alerts
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
var alertPolyon;
var alertPolygonString;
var alertMarkers = [];
var alertPath;

var countCriterion;

/* -------------------------------------------------------------------------------- */
/**
 * Setup and initalize the alert setup mode
 **/
function setupAlertInitialize() {
   //Don't initialize if the alert dialog window is already opened
   if ($('#setup-alert-modal').dialog("isOpen")) {
      return;
   }

   $('#setup-alert-modal')
   .load('setup-alerts.html', function() {
        $("#dialog").dialog("open");
    })
   .dialog('open');

   //Hide the panel menu to give more room on the maps
   $('#panel').toggle(false);
   $('#alertPanel').toggle(false);

   initializePolygon();

   //Add listeners to drawing events
   google.maps.event.addListener(map, 'click', addPoint);

   //Auto populate the email field based on the global userid
   if (userid == 'icodeuser') {
      setTimeout(function() {
      $('#emailaddress').val('icodemda@gmail.com');
      }, 100);
   }

   //Listen for end setup mode
   $('#setup-alert-modal').bind('dialogclose', function(event) {
      google.maps.event.clearListeners(map, 'click');
      deletePolygon();
      $('#panel').toggle(true);
      $('#alertPanel').toggle(true);
   });

   countCriterion = 0;
}

/* -------------------------------------------------------------------------------- */
/**
 * End the "setup alert" mode
 **/
function setAlertEnd() {
   console.log('setAlertEnd(): Exiting alert setup mode');
   $('#setup-alert-modal').dialog('close');

   deletePolygon();

   countCriterion = 0;

   //Unhide the panel menu
   $('#panel').toggle(true);
}

/* -------------------------------------------------------------------------------- */
/**
 * Initialize the polygon
 **/
function initializePolygon() {
   alertPath = new google.maps.MVCArray;

   //Prepare the alertPolygon
   alertPolyon = new google.maps.Polygon({
      strokeWeight: 3,
      fillColor: '#5555FF',
      fillOpacity: 0.2,
      strokeColor: '#5555FF',
      strokeOpacity: 0.8,
      geodesic: true
   });
   alertPolyon.setMap(map);
   alertPolyon.setPaths(new google.maps.MVCArray([alertPath]));
}

/* -------------------------------------------------------------------------------- */
/**
 * Reset and erase the polygon
 **/
function resetPolygon() {
   if (alertPolyon != null) {
      alertPolyon.setMap(null);
      alertPolyon = null;
   }
   initializePolygon();

   //Erase alertMarkers
   for (var i=0; i < alertMarkers.length; i++) {
      alertMarkers[i].setMap(null);
   }
   alertMarkers = [];

   updatePolygonField();
}

/* -------------------------------------------------------------------------------- */
function deletePolygon() {
   alertPath = [];

   if (alertPolyon != null) {
      alertPolyon.setMap(null);
      alertPolyon = null;
   }

   //Erase alertMarkers
   for (var i=0; i < alertMarkers.length; i++) {
      alertMarkers[i].setMap(null);
   }
   alertMarkers = [];
}

/* -------------------------------------------------------------------------------- */
/**
 * Add a polygon vertex
 **/
function addPoint(event) {
   alertPath.insertAt(alertPath.length, event.latLng);

   computeArea();

   var marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true,
      icon: 'http://maps.google.com/mapfiles/ms/micons/purple-dot.png'
   });
   alertMarkers.push(marker);
   marker.setTitle("#" + alertPath.length);

   google.maps.event.addListener(marker, 'rightclick', function() {
      marker.setMap(null);
      for (var i = 0, I = alertMarkers.length; i < I && alertMarkers[i] != marker; ++i);
      alertMarkers.splice(i, 1);
      alertPath.removeAt(i);
      updatePolygonField();
   });

   google.maps.event.addListener(marker, 'dragend', function() {
      for (var i = 0, I = alertMarkers.length; i < I && alertMarkers[i] != marker; ++i);
      alertPath.setAt(i, marker.getPosition());
      
      computeArea();

      updatePolygonField();
   });

   updatePolygonField();
}

/* -------------------------------------------------------------------------------- */
/**
 * Compute the area of the drawn polygon
 **/
function computeArea() {
   var area = google.maps.geometry.spherical.computeArea(alertPath);
   console.log('area = ' + area);

   return area;
}

/* -------------------------------------------------------------------------------- */
/**
 * Update the polygon definition in the textarea field of the form
 **/
function updatePolygonField()
{
   var formdataObject = document.forms['alert_definition'];
   var formdataElement = formdataObject.elements["alertpolygon"];
   //var formdataElement = $('#alertpolygon');

   if(alertPath.getLength() < 3){
      formdataElement.value = '';
      return;
   }
   var coords = '';
   for(var i = 0; i < alertPath.getLength(); i++){
      var point = alertPath.getAt(i);
      coords += point.lng();
      coords += ' ';
      coords += point.lat();
      coords += ',';
   }

   var point = alertPath.getAt(0); 
   coords += point.lng();     //WKT format is (LON, LAT)
   coords += ' ';
   coords += point.lat();     //WKT format is (LON, LAT)

   //Save polygon string definition
   alertPolygonString = 'POLYGON((';
   alertPolygonString += coords;
   alertPolygonString += '))';

   coords = coords.replace(/,/g,",\n");
   formdataElement.value = coords;

   //Increase the size of the textarea showing the coordinates of the alertPolygon
   //$('#polygon').attr('rows', alertPath.length+1);
}

/* -------------------------------------------------------------------------------- */
function saveAlert(){
   /*
   //DEBUG TESTING PURPOSE
   alertPolygonString = '1.56005859375 6.0203850824560226, 1.91162109375 5.779966445034052, 1.56005859375 5.637852598770866, 1.56005859375 6.0203850824560226';
   $('#alertpolygon').val(alertPolygonString);
   $('#emailaddress').val('test@test.com');
   */

   //========================= ADD ALERT PROPERTIES ==================================
   //Obtain user's ROI polygon definition
   //check area of polygon to limit size to prevent long queries
   /*
   if (computeArea() > 3000000000) {
      alert('Please draw a smaller polygon.');
      return;
   }
   */

   //check if polygon is defined
   if (typeof alertPolygonString === 'undefined' || alertPolygonString == '') {
      alert('Please define polygon');
      return;
   }

   var phpWithArg = 'query_alert_setup.php?userid=' + userid;

   phpWithArg += '&alertPolygon=' + alertPolygonString;
   alertPolygonString = '';   //clear the polygon string for the next alert

   var entering = $('#alertenteringarea');
   var exiting = $('#alertexitingarea');

   if (entering.is(':checked')) {
      phpWithArg += '&entering=true';
   }
   if (exiting.is(':checked')) {
      phpWithArg += '&exiting=true';
   }

   var updateinterval = $('#updateinterval').val();
   phpWithArg += '&interval=' + updateinterval;

   //TODO: check if email is valid and sanitize before using
   var emailStr = $('#emailaddress').val();
   if (typeof emailStr === 'undefined' || emailStr === '') {
      alert('Please define email');
      return;
   }
   phpWithArg += '&email="' + emailStr + '"';


   //TODO: Add criteria arguments
   //Parse criteria
   if ($('#alertfield1 option:selected').text() === 'ALL VESSELS') {
      //no criteria needs to be added
      console.log('saveAlert(): No criteria to be added');
   }
   else {
      var field, operation, value;

      //iterate through all criteria that the user defined
      for (var i=1; i < $('.criterialabel').length+1; i++) {
         //Build SQL strings from criteria
         field = $('#alertfield'+i+' option:selected').text();
         operation = $('#alertoperation'+i+' option:selected').text();
         value = $('#alertvalue'+i).val();
         console.log(i, field);
         console.log(i, operation);
         console.log(i, value);

         //Add criteria arguments to phpWithArg
         phpWithArg += '&field[]=' + field;
         phpWithArg += '&operation[]=' + operation;
         phpWithArg += '&value[]=' + value;
      }
   }

   //Final resulting PHP call with all arguments
   console.log('saveAlert():', phpWithArg);

   //Call the PHP script to insert new alert row to alert database
   console.log('Calling PHP script to push new alert_properties element...');
   $.getJSON(
         phpWithArg, 
         function (){ 
            console.log('saveAlert(): Success on adding new alert');
         }
      )
   .done(function (response) {
      //console.log('saveAlert(): ' + response.query);

      console.log('saveAlert(): Added new alert id ' + response.alert_id);
      
      //Notify server about newly added alert so that it can be added for monitoring
      var connection = new WebSocket('ws://' + WS_ADDRESS + ':' + WS_PORT);

      //==================== Opened connection to the server =========================
      connection.onopen = function () {
         //Connected to server success

         //Send notification of new alert
         connection.send(JSON.stringify({type:'newalert', data: response.alert_id }));

         //TODO: listen for success response from server
         connection.close();
      };

      //Exit the "setup alert" mode
      setAlertEnd();
   }) // END .done()
   .fail(function() {
      console.log('saveAlert(): ' +  'No response from alert database; error in php?'); 

      alert('Alert not saved.  Please try again later.');

      return;
   }); //END .fail()
}

/**
 * Sets the alert dropdown options to hashable values (i.e. strings-like fields)
 * source: http://stackoverflow.com/questions/1801499/how-to-change-options-of-select-with-jquery
 **/
function setHashOptions(selectoperation, alertvalue, addCriterionButton) {
   var hashOptions = {'equals': 'equals',
                        'contains': 'contains',
                        'starts with': 'starts with',
                        'ends with': 'ends with'};

   selectoperation.show();
   alertvalue.show();
   addCriterionButton.show();

   selectoperation.empty();
   $.each(hashOptions, function(key, value) {
      selectoperation.append($("<option></option>")
      .attr("value", value).text(key));
   });
}

/**
 * Sets the alert dropdown options to range type (=, !, <, >)
 * source: http://stackoverflow.com/questions/1801499/how-to-change-options-of-select-with-jquery
 **/
function setRangeOptions(selectoperation, alertvalue, addCriterionButton) {
   var rangeOptions = {'=': 'equals',
                       '!': 'not equals',
                       '>': 'greater than',
                       '<': 'less than'};

   selectoperation.show();
   alertvalue.show();
   addCriterionButton.show();

   selectoperation.empty();
   $.each(rangeOptions, function(key, value) {
      selectoperation.append($("<option></option>")
      .attr("value", value).text(key));
   });
}

/**
 * Sets the vessel type dropdown options
 **/
function setVesseltypeOptions(selectoperation, alertvalue, addCriterionButton) {
   var rangeOptions = {'is': 'equals',
                       'is not': 'not equals'};

   selectoperation.show();
   alertvalue.show();
   addCriterionButton.show();

   selectoperation.empty();
   $.each(rangeOptions, function(key, value) {
      selectoperation.append($("<option></option>")
      .attr("value", value).text(key));
   });
}

/**
 * Sets the appropriate dropdown operators depending on the field selected
 **/
function setAlertOptions(index) {
   var selectoperation = $('#alertoperation'+index);
   var alertvalue = $('#alertvalue'+index);
   var selectedField = $('#alertfield'+index+' option:selected').val();

   var addCriterionButton = $('#addcriterion');

   switch (selectedField) {
      case 'all':
         selectoperation.hide();
         alertvalue.hide();
         addCriterionButton.hide();

         //Delete all other criteria; reset the criteria
         if (countCriterion > 1) {
            countCriterion = 0;
            $('#criteria').empty();
            addCriterionRow();
         }
         
         break;
      case 'mmsi':
         setHashOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'imo':
         setHashOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'vesselname':
         setHashOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'callsign':
         setHashOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'destination':
         setHashOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'vesseltype':
         setVesseltypeOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'length':
         setRangeOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'width':
         setRangeOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      case 'draught':
         setRangeOptions(selectoperation, alertvalue, addCriterionButton);
         break;
      default:
   }
}

function addCriterionRow() {
   var divCriteria = $('#criteria');

   countCriterion++;

   //New alert field
   var newalertfield = $('<select>').attr({
      class: 'criterialabel',
      id: 'alertfield' + countCriterion,
      width: '300px',
      onchange: 'setAlertOptions(' + countCriterion + ')'
   }).appendTo(divCriteria);

   var alertfieldoptions = {
                       'MMSI': 'mmsi',
                       'IMO': 'imo',
                       'VESSELNAME': 'vesselname',
                       'CALLSIGN': 'callsign',
                       'DESTINATION': 'destination',
                       'VESSELTYPE': 'vesseltype',
                       'LENGTH': 'length',
                       'WIDTH': 'width',
                       'DRAUGHT': 'draught'};

   if (countCriterion == 1) {
      var alertfieldoptions = {'ALL VESSELS': 'all',
                               'MMSI': 'mmsi',
                               'IMO': 'imo',
                               'VESSELNAME': 'vesselname',
                               'CALLSIGN': 'callsign',
                               'DESTINATION': 'destination',
                               'VESSELTYPE': 'vesseltype',
                               'LENGTH': 'length',
                               'WIDTH': 'width',
                               'DRAUGHT': 'draught'};
   }


   $.each(alertfieldoptions, function(key, value) {
      newalertfield.append($('<option></option>')
      .attr("value", value).text(key));
   });


   //New alert operation
   var newalertfield = $('<select>').attr({
      id: 'alertoperation' + countCriterion
   }).appendTo(divCriteria);

   newalertfield.hide();
  
   //New alert operation
   var newalertvalue = $('<input>').attr({
      type: 'text',
      id: 'alertvalue' + countCriterion,
      size: '30'
   }).appendTo(divCriteria);

   newalertvalue.hide();

   //Add new line
   $('<br />').appendTo(divCriteria);

   setAlertOptions(countCriterion);
}

function removeCriterionRow(index) {
}
