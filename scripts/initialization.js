/**
 * Initialization script for maps on page load
 **/

//Global Objects
var userid;

$(function() { //shorthand for: $(document).ready(function() {
   //Call setup functions
   setupUser();
   queryBar();
   geocodingBox();
   menuDivPanels();
   progressBar();
   sortableLayers();
   setupAlertAccordion();
   initializeBrowserFocus();

   //Setup functions definitions =========================================================
   function setupUser() {
      //Main userid global setting
      userid = 'icodeuser';   //temporarily set to icodeuser for testing

      $(document).ready(function() {
         $('#username').text(userid);
      });
   }

   function queryBar() {
      //Query bar text control
      //Select all text if query bar comes into focus
      $('#query:text').focus(function() { 
         $(this).one('mouseup', function(event){
            event.preventDefault();
         }).select();
      });
   }

   function geocodingBox() {
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
         var thisLiElement = $(this).parent('.layerHeading').parent('.panel');

         //Skip disabled elements
         if (thisLiElement.hasClass('ui-state-disabled')) {
            //Don't move disabled layers
            return;
         }

         //Determine element's previous position based on minus icon, then move it to the opposite group
         if ($(this).hasClass('glyphicon-minus')) {
            $('#hiddenLayersList').prepend(thisLiElement);
            //$(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
         }
         else {
            $('#displayedLayersList').append(thisLiElement);
            //$(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
         }

         //Then call the normal sortable list update function
         listUpdated();
      });

      //Control the behavior of layer options button clicking
      $('.layersOptionsBtn').on('click', function(e) {
         var panelToToggle = $(this).parents('.layerHeading').parents('.panel').children('.layerBody');
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
});

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

         var newShownLayerID = $('#displayedLayersList').children('.panel').children('.layerHeading').children('.glyphicon-plus').parent('.layerHeading').parent('.panel').attr('id');
         var newHiddenLayerID = $('#hiddenLayersList').children('.panel').children('.layerHeading').children('.glyphicon-minus').parent('.layerHeading').parent('.panel').attr('id');

         //Update hideShow button icons
         $('#displayedLayersList').children('.panel').children('.layerHeading').children('.hideShowLayerBtn').removeClass('glyphicon-plus').addClass('glyphicon-minus');
         //Update hideShow button icons
         $('#hiddenLayersList').children('.panel').children('.layerHeading').children('.hideShowLayerBtn').removeClass('glyphicon-minus').addClass('glyphicon-plus');
         
         //Refresh layers on the map
         //TODO: pass in exactly the layer that was changed
         refreshLayers(newShownLayerID, newHiddenLayerID);
      }
