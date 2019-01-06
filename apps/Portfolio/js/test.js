window.onload = function(){
  $('body').fadeIn(2000);

  $("#work-des01").mouseover(
    function(){
      $("#work-des01").opacity = 1.0;
    }
  );

  $("#work-img01").mouseover(
    function(){
      $("#work-des01").fadeIn();
    }
  );

  $("#work-img01").mouseout(
    function(){
      $("#work-des01").fadeOut();
    }
  );

  $("#work-img02").mouseover(
    function(){
      $("#work-des02").fadeIn();
    }
  );
  $("#work-img02").mouseout(
    function(){
      $("#work-des02").fadeOut();
    }
  );
  $("#work-img03").mouseover(
    function(){
      $("#work-des03").fadeIn();
    }
  );
  $("#work-img03").mouseout(
    function(){
      $("#work-des03").fadeOut();
    }
  );
  $("#work-img04").mouseover(
    function(){
      $("#work-des04").fadeIn();
    }
  );
  $("#work-img04").mouseout(
    function(){
      $("#work-des04").fadeOut();
    }
  );

  $("#work-img05").mouseover(
    function(){
      $("#work-des05").fadeIn();
    }
  );
  $("#work-img05").mouseout(
    function(){
      $("#work-des05").fadeOut();
    }
  );

  $("#work-img06").mouseover(
    function(){
      $("#work-des06").fadeIn();
    }
  );
  $("#work-img06").mouseout(
    function(){
      $("#work-des06").fadeOut();
    }
  );

}
