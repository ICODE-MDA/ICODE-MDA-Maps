/**
 * Initialization script for maps on page load
 **/

//Global Objects
var userid;

$(function() { //shorthand for: $(document).ready(function() {
   //Call setup functions
   setupUser();
   queryBarBehavior();
   searchBehavior();
   advanceSearchBehavior();
   geocodingBox();
   menuDivPanels();
   progressBar();
   sortableLayers();
   setupAlertAccordion();
   //initializeBrowserFocus();
   queryStatementBehavior();
   fileKMZUploadBehavior();
   setupTimeMachine();

   //Setup functions definitions =========================================================
   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function setupUser() {
      //Main userid global setting
      userid = 'icodeuser';   //temporarily set to icodeuser for testing

      $(document).ready(function() {
         $('#username').text(userid);
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function queryBarBehavior() {
      /*
      //Query bar text control
      //Select all text if query bar comes into focus
      $('#query:text').focus(function() { 
         $(this).one('mouseup', function(event){
            //event.preventDefault();
         }).select();
      });
      */
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function searchBehavior() {
      $('#searchBarForm').submit(function(e) {
         e.preventDefault();
         console.debug('Regular search initiated.');
         advancedSearchEnabled = false;
         search();
      });

      $('#advancedSearchForm').submit(function(e) {
         e.preventDefault();
         console.debug('Advanced search initiated.');
         advancedSearchEnabled = true;
         search();
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function advanceSearchBehavior() {
      //Handle toggling advanced search box
      $('#advancedSearchToggle').mousedown( function() {
         $('#advancedSearchDropdown').toggle();

         if ( !$('#advancedSearchDropdown').is(":visible") ) {
            //Show the box
            $('#advancedSearchToggle').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
         }
         else {
            //Hide the box
            $('#advancedSearchToggle').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
         }
      });

      //Hide advanced search if clicked outside of box
      $(document).mouseup( function(e) {
         var container = $("#advancedSearchDropdown");

         if ( $('#advancedSearchDropdown').is(":visible")
            && !container.is(e.target) // if the target of the click isn't the container...
            && container.has(e.target).length === 0 // ... nor a descendant of the container
            && !$('#advancedSearchToggle').is(e.target) )
         {
            $('#advancedSearchToggle').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            container.hide();
         }
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function geocodingBox() {
      $("#geocode-form").submit(function(e) {
         e.preventDefault();
         codeAddress();
      });

      //Geocoding text box control
      $('#geocodeAddress')
         .focus(function() { 
            $(this).one('mouseup', function(event){
               //event.preventDefault();
            }).select();

            //Release focus on input field if clicked outside
            /*
            $(document).mouseup(function (e) {
               if (!$('#geocodeAddress').is(e.target)) {
                  $('#geocodeAddress').blur();
               }
            });
            */
         });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function menuDivPanels() {
      //Initialize the menuDiv panels' collapsing behavior
      $('.panel-collapse').collapse({'toggle': false});

      //Control the behavior of menu heading clicking
      $('.menuHeading').on('click', function(e) {
         var panelToToggle = $(this).parents('.panel').children('.menuBody');
         var glyphiconToToggle = $(this).children('.btn').children('.glyphicon-menu');

         //Flip the icon
         if (panelToToggle.hasClass('in')) {
            glyphiconToToggle.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
         }
         else {
            glyphiconToToggle.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
         }

      //Hide all others, then toggle the one that was clicked
      $('.menuBody').collapse('hide');
      panelToToggle.collapse('toggle');
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function progressBar() {
      //Data reload progress bar style behavior initialization
      NProgress.configure({ 
         ease: 'ease', 
         trickleRate: 0.02,
         trickleSpeed: 50,
         showSpinner: false,
         minimum: 0.3,
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function sortableLayers() {
      //Sortable
      var displayedLayersList = $('#displayedLayersList');
      var hiddenLayersList = $('#hiddenLayersList');

      displayedLayersList.sortable({
         // Only make the .layerHeading child elements support dragging.
         handle: '.layerHeading',
         cursor: 'move',
         connectWith: '.connectedSortable',
         placeholder: 'ui-state-highlight',
         cancel: '.ui-state-disabled',
         update: listUpdated
      });
      hiddenLayersList.sortable({
         // Only make the .layerHeading child elements support dragging.
         handle: '.layerHeading',
         cursor: 'move',
         connectWith: '.connectedSortable',
         placeholder: 'ui-state-highlight',
         cancel: '.ui-state-disabled',
         //update: //only need to call update once, called from displayedLayersList.  listUpdated performs both functions
      });

      //Control the behavior of sorting manipulation via buttons
      $('.hideShowLayerBtn').on('mousedown', function(e) {
         //Look for the clicked panel's li element
         var thisLiElement = $(this).closest('.layerHeading').parent('.panel');

         //Skip disabled elements
         if (thisLiElement.hasClass('ui-state-disabled')) {
            //Don't move disabled layers
            return;
         }

         //Determine element's previous position based on minus icon, then move it to the opposite group
         if ($(this).hasClass('glyphicon-minus-sign')) {
            $('#hiddenLayersList').prepend(thisLiElement);
         }
         else {
            $('#displayedLayersList').append(thisLiElement);
         }

         //Then call the normal sortable list update function
         listUpdated();
      });

      //Control the behavior of layer options button clicking
      $('.layersOptionsBtn').on('click', function(e) {
         var panelToToggle = $(this).closest('.layerHeading').parents('.panel').children('.layerBody');
         var glyphiconToToggle = $(this).children('.glyphicon-menu');

         //Flip the icon
         if (panelToToggle.hasClass('in')) {
            glyphiconToToggle.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
         }
         else {
            glyphiconToToggle.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
         }

         //Toggle the options panel
         panelToToggle.collapse('toggle');
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function setupAlertAccordion() {
      $("#alertAccordion").accordion({
         collapsible: true,
      heightStyle: "content",
      autoHeight: false,
      });
      $(window).resize(function(){
         if ($("#alertAccordion").accordion != undefined) {
            $("#alertAccordion").accordion("refresh");
         }
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function initializeBrowserFocus() {
      function onBlur() {
         document.body.className = 'blurred';
         console.log('Browser tab out of focus');
         browserFocus = false;
      };

      function onFocus(){
         document.body.className = 'focused';
         console.log('Browser tab in focus');
         browserFocus = true;
         //Refresh the maps on focus if an attempt to refresh was made while out of focus
         if (queuedRefresh) {
            queuedRefresh = false;  //reset flag
            refreshMaps(true);
            refreshLayers();
         }
      };

      if (/*@cc_on!@*/false) { // check for Internet Explorer
         document.onfocusin = onFocus;
         document.onfocusout = onBlur;
      }
      else {
         window.onfocus = onFocus;
         window.onblur = onBlur;
      }
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function queryStatementBehavior() {
      $('.queryStatement').click(function() {
         $(this).select();
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function fileKMZUploadBehavior() {
      $(document).on('change', '.btn-file :file', function() {
         //START upload
         console.log(this.files[0]);
         var file = this.files[0];
         var xhr = new XMLHttpRequest();
         xhr.file = file; // not necessary if you create scopes like this
         
         //Listen for upload progress
         xhr.addEventListener('progress', function(e) {
            var done = e.position || e.loaded, total = e.totalSize || e.total;
            console.log('xhr progress: ' + (Math.floor(done/total*1000)/10) + '%');
         }, false);

         //Handle upload progress
         if (xhr.upload) {
            xhr.upload.onprogress = function(e) {
               var done = e.position || e.loaded, total = e.totalSize || e.total;

               var percentage = Math.floor(done/total*1000)/10;
               //console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + percentage + '%');

               if (!$('#kmzprogressbar').hasClass('active')) {
                  $('#kmzprogressbar').addClass('active').addClass('progress-bar-striped');
               }
               $('#kmzprogressbar').css('width', percentage+'%').attr('aria-valuenow', percentage).html(percentage+'%');
            };
         }
         
         //Listen for upload complete
         xhr.onreadystatechange = function(e) {
            if ( 4 == this.readyState ) {
               //console.log(['xhr upload complete', e]);
               $('#kmzprogressbar').removeClass('active').removeClass('progress-bar-striped');
               $('#kmzprogressbar').css('width', '100%').attr('aria-valuenow', 100).html('KMZ Uploaded');
            }
         };

         xhr.open('POST', 'kmz/kmzextract.php', true);

         var fd = new FormData();
         fd.append("file", file);
         xhr.send(fd);

         xhr.onload = function() {
            if (this.status == 200) {
               //console.log(this.response);

               var resp = JSON.parse(this.response);

               //console.log('Server got:', resp);

               //Show KML
               showUploadedKMZ(resp.datetime);

               //move layer to displayed layers sortable list
               var thisLiElement = $('#kmzLayer');
               $('#displayedLayersList').append(thisLiElement);
               listUpdated();
            };
         };
         //END upload


         var input = $(this);
         var numFiles = input.get(0).files ? input.get(0).files.length : 1;
         var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
         //Force trigger fileselect
         input.trigger('fileselect', [numFiles, label]);
      });

      //Handle file selection
      $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
         //Adjust UI buttons
         if ($('.fileinput-remove-button').length == 0) {
            $('.btn-file').before('<button type="button" class="btn btn-default fileinput-remove fileinput-remove-button"> <i class="glyphicon glyphicon-ban-circle"></i> </button>');
         }

         //Handle filename text
         var input = $(this).parents('.input-group').find(':text');
         var log = numFiles > 1 ? numFiles + ' files selected' : label;

         //Handle remove file behavior
         $('.fileinput-remove-button').click(function() {
            input.val('');
            $(this).remove();
            $('#kmzprogressbar').css('width', '0%').attr('aria-valuenow', 0).html('');
         });

         if(input.length) {
            input.val(log);
         }
         else {
            if(log) {
               alert(log);
            }
         }
      });
   }

   /* -------------------------------------------------------------------------------- */
   /**
    * 
    **/
   function setupTimeMachine() {
      /*
      $('#timemachinestart').datetimepicker({
         format: 'yyyy-mm-dd hh:ii',
         autoclose: true,
         todayBtn: true,
         minuteStep: 15,
         todayHighlight: true,
         forceParse: true,
         minView: 1
      });
      $('#timemachinestart').datetimepicker('setStartDate', '2013-11-19');
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate()-1);
      yesterday.setHours(0);
      yesterday.setMinutes(0);
      $('#timemachinestart').datetimepicker('update', yesterday);
      */

      $('#timemachineend').datetimepicker({
         format: 'yyyy-mm-dd hh:ii',
         autoclose: true,
         todayBtn: true,
         minuteStep: 15,
         todayHighlight: true,
         forceParse: true,
         minView: 0
      })
      .on('changeDate', function(ev){
         console.log($(this).val());
         TimeMachineEnd = $('#timemachineend').datetimepicker('getDate').getTime()/1000 - 60*(new Date()).getTimezoneOffset();

         refreshLayers();
      });

      if (Request.QueryString('endtime').Count() > 0) {
         var endtime = Request.QueryString("endtime").toString();
         $('#timemachineend').datetimepicker('setDate', new Date(endtime * 1000));
         TimeMachineEnd = parseInt(endtime) - parseInt(60*(new Date()).getTimezoneOffset());
      }
      else {
         //$('#timemachineend').val('Now'); <-- causes time to default to year 1899!
      }

      if (Request.QueryString('age').Count() > 0) {
         var age = Request.QueryString("age").toString();
         $('#vessel_age').val(age);
      }
   }
});

/* -------------------------------------------------------------------------------- */
/**
 * 
 **/
function getCurrentViewURL() {
   var url;

   if (document.URL.indexOf('index.html') != -1) {
      url = document.URL.substr(0, document.URL.indexOf('index.html')) + 'index.html?';
   }
   else {
      url = document.URL + 'index.html?';
   }

   //Map center
   var center = map.getCenter();
   url += 'center=' + center.lat().toFixed(3).toString() + ',' + center.lng().toFixed(3).toString();

   //Zoom
   var zoom = map.getZoom();
   url += '&zoom=' + zoom.toString();

   //Vessel age
   if (vessel_age != -1) {
      url += '&age=' + vessel_age;
   }

   //Time Machine
   if (TimeMachineEnd != null) {
      url += '&endtime=' + (parseInt(TimeMachineEnd) + parseInt(60*(new Date()).getTimezoneOffset()));
   }

   //Layers
   var layerIDs = [];
   if ($('#displayedLayersList > li').length > 0) {
      url +='&layers=';
      $('#displayedLayersList > li').each( function() {
         layerIDs.push(this.id);
      })
      layerIDs.forEach( function(layerID, index) {
         url += layerID;
         if (index != $('#displayedLayersList > li').length - 1) {
            url += ',';
         }
      });
   }

   //Set the URL
   $('#viewurl').attr('href', url);
}

//Globally exposed functions
//Function to control what happens after list is updated
function listUpdated() {
   $('.panel', displayedLayersList).each(function(index, elem) {
      var $listItem = $(elem);
      var newIndex = $listItem.index();   //updated indices
   });
   $('.panel', hiddenLayersList).each(function(index, elem) {
      var $listItem = $(elem);
      var newIndex = $listItem.index();   //updated indices
   });

   //Traverse down the elements, then back up to find the identity of the new shown panel
   var newShownLayerID = $('#displayedLayersList').find('.glyphicon-plus-sign').closest('.layerHeading').parent('.panel').attr('id');
   //Traverse down the elements, then back up to find the identity of the new hidden panel
   var newHiddenLayerID = $('#hiddenLayersList').find('.glyphicon-minus-sign').closest('.layerHeading').parent('.panel').attr('id');

   //Update hideShow button icons
   $('#displayedLayersList').children('.panel').children('.layerHeading').find('.hideShowLayerBtn').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
   //Update hideShow button icons
   $('#hiddenLayersList').children('.panel').children('.layerHeading').find('.hideShowLayerBtn').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');

   //Update panel color based on layer visibility
   $('#displayedLayersList').children('.panel-default').removeClass('panel-default').addClass('panel-success');
   $('#displayedLayersList').find('.btn-xs').removeClass('btn-default').addClass('btn-success');
   $('#hiddenLayersList').children('.panel-success').removeClass('panel-success').addClass('panel-default');
   $('#hiddenLayersList').find('.btn-xs').removeClass('btn-success').addClass('btn-default');

   //Refresh layers on the map
   refreshLayers(newShownLayerID, newHiddenLayerID);
}
