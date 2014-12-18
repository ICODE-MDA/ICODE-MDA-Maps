function loadClippy() {
   clippy.load('Clippy', function(agent){
      // do anything with the loaded agent
      agent.show();
      agent.moveTo(window.innerWidth-400, window.innerHeight-130);
      agent.speak('Welcome to ICODE-MDA Maps!  I am here to help you and do funny animations.');
      agent.animate();

      setInterval(function() {
         var h = $(window).height() - 400;
         var w = $(window).width() - 400;
         var nh = Math.floor(Math.random() * h) + 200;
         var nw = Math.floor(Math.random() * w) + 200;
         agent.moveTo(nw,nh);             

         agent.speak('It looks like you are trying to find pirates.  Would you like help?');
         agent.animate();
      }, 15000);

   });

   return;
}
