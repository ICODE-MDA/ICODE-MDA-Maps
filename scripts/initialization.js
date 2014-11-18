/**
 * Initialization script for maps on page load
 **/
$(function() { //shorthand for: $(document).ready(function() {
   //Call setup functions
   setupUser();
   queryBar();
   geocodingBox();
   menuDivPanels();
   progressBar();
   sortableLayers();

   //Setup functions definitions =========================================================
   function setupUser() {
      //Main userid global setting
      var userid = 'icodeuser';   //temporarily set to icodeuser for testing

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
               event.preventDefault();
            }).select();

            //Release focus on input field if clicked outside
            $(document).mouseup(function (e) {
               if (!$('#geocodeAddress').is(e.target)) {
                  $('#geocodeAddress').blur();
               }
            });
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
         update: function () {
            $('.panel', displayedLayersList).each(function(index, elem) {
               var $listItem = $(elem);
               var newIndex = $listItem.index();   //updated indices
            });

            //Update hideShow button icons
            $('#displayedLayersList').children('.panel').children('.layerHeading').children('.hideShowLayerBtn').removeClass('glyphicon-plus').addClass('glyphicon-minus');
         }
      });
      hiddenLayersList.sortable({
         // Only make the .layerHeading child elements support dragging.
         handle: '.layerHeading',
         cursor: 'move',
         connectWith: '.connectedSortable',
         update: function () {
            $('.panel', hiddenLayersList).each(function(index, elem) {
               var $listItem = $(elem);
               var newIndex = $listItem.index();   //updated indices
            });

            //Update hideShow button icons
            $('#hiddenLayersList').children('.panel').children('.layerHeading').children('.hideShowLayerBtn').removeClass('glyphicon-minus').addClass('glyphicon-plus');
         }
      });

      //Control the behavior of sorting manipulation via buttons
      $('.hideShowLayerBtn').on('click', function(e) {
         var thisLiElement = $(this).parent('.layerHeading').parent('.panel');

         if ($(this).hasClass('glyphicon-minus')) {
            $('#hiddenLayersList').prepend(thisLiElement);
            $(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
         }
         else {
            $('#displayedLayersList').append(thisLiElement);
            $(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
         }
      });

      //Control the behavior of layer heading clicking
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
});
