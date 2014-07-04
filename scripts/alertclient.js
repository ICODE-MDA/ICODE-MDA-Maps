$(function () {
   "use strict";

   // for better performance - to avoid searching in DOM
   var content = $('#content');
   var alertLabel = $('#alertLabel');

   var user = 'icodeuser';

   // my color assigned by the server
   var myColor = false;
   // my name sent to the server
   var myName = false;

   // if user is running mozilla then use it's built-in WebSocket
   window.WebSocket = window.WebSocket || window.MozWebSocket;

   // if browser doesn't support WebSocket, just show some notification and exit
   if (!window.WebSocket) {
      content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
         + 'support WebSockets.'} ));
         $('span').hide();
         return;
   }

   // open connection
   var connection = new WebSocket('ws://127.0.0.1:2411');

      connection.onopen = function () {
         // first we want users to enter their names
         alertLabel.text('Connected to alert server as user: ' + user);
         connection.send(user);
      };

      connection.onerror = function (error) {
         // just in there were some problems with conenction...
         content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.' } ));
      };

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
            console.log('Received alert from server');
            content.append(json.data + '<br>');
         }
         else if (json.type === 'alertHistory') {
         }
         else if (json.type === 'progress') {
            console.log('Received progress report from server');
            content.append(json.data + '<br>');
         }
         else {
            console.log('Data from server unrecognized', json);
         }
      };

      /**
      * This method is optional. If the server wasn't able to respond to the
      * in 3 seconds then show some error message to notify the user that
      * something is wrong.
      */
      setInterval(function() {
         if (connection.readyState !== 1) {
            alertLabel.text('Error');
            //input.attr('disabled', 'disabled').val('Unable to comminucate '
            //+ 'with the WebSocket server.');
         }
      }, 3000);
});
