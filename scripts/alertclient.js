toastr.options = {
  "closeButton": false,
  "debug": false,
  "positionClass": "toast-bottom-left",
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

$(function start() {
   "use strict";

   // for better performance - to avoid searching in DOM
   var content = $('#content');
   var alertLabel = $('#alertLabel');
   var alertCountLabel = $('#alertCountLabel');
   var processedCountLabel = $('#processedCountLabel');

   var user = 'icodeuser';

   var alertCountTotal = 0;

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
   var connection = new WebSocket('ws://127.0.0.1:2411');

      connection.onopen = function () {
         //Connected to server success
         alertLabel.html('<b>Connected to alert server as user: </b>' + user);
         connection.send(user);
      };

      connection.onclose = function () {
         console.log('Server went down');
         alertLabel.text('Server went down');
         //try to reconnect every 3 seconds
         setTimeout(function() {
            console.log('Attempting to reconnect...');
            start();
         }, 1000);
      };

      /*
      connection.onerror = function (error) {
         //Connection to server error
         //alertLabel.html($('<p>', { text: 'Connection to the server is down.' } ));
         alertLabel.html('Cannot connect to server');

         //Attempt to reconnect here
         setTimeout(function() {
            console.log('Checking connection');
            alertLabel.text('Checking connection');

            connection = new WebSocket('ws://127.0.0.1:2411');

               if (connection.readyState !== 1) {
                  alertLabel.text('Error');
                  //input.attr('disabled', 'disabled').val('Unable to comminucate '
                  //+ 'with the WebSocket server.');
               }
         }, 3000);
      };
      */

      // most important part - incoming messages
      connection.onmessage = function (message) {
         // try to parse JSON message. Because we know that the server always returns
         // JSON this should work without any problem but we should make sure that
         // the massage is not chunked or otherwise damaged.
         try {
            var json = JSON.parse(message.data);
         } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
         }

         if (json.type === 'response') {
            var serverResponse = json.data;
            console.log('Server responded with:', serverResponse);
         }
         else if (json.type === 'alertNotification') {
            var decodedAIS = JSON.parse(json.data);

            console.log('Received alert from server');
            content.prepend(json.data + '<br>');

            toastr.success(decodedAIS.mmsi + ' detected in ROI!');
            console.log(decodedAIS);

            alertCountTotal++;
            alertCountLabel.text(alertCountTotal);
         }
         else if (json.type === 'alertHistory') {
         }
         else if (json.type === 'totalDecoded') {
            console.log('Received progress report from server');
            //content.prepend(json.data + '<br>');
            //toastr.info(json.data)
            processedCountLabel.html(json.data);
         }
         else {
            console.log('Data from server unrecognized', json);
         }
      };
});
