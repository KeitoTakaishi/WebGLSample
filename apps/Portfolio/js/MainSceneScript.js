//MainSceneのjs

window.onload = function(){
  $('body').fadeIn(500);
  $("#work-img01").fadeIn(500);
  $("#work-img02").fadeIn(2000);
  $("#work-img03").fadeIn(1000);
  $("#work-img04").fadeIn(2000);
  $("#work-img05").fadeIn(500);
  $("#work-img06").fadeIn(1200);
  $("#work-img07").fadeIn(1200);
  $("#work-img08").fadeIn(800);
  $("#work-img09").fadeIn(1200);





  //---Titleの出現エフェクト
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

  $("#work-img07").mouseover(
    function(){
      $("#work-des07").fadeIn();
    }
  );
  $("#work-img07").mouseout(
    function(){
      $("#work-des07").fadeOut();
    }
  );

  $("#work-img08").mouseover(
    function(){
      $("#work-des08").fadeIn();
    }
  );
  $("#work-img08").mouseout(
    function(){
      $("#work-des08").fadeOut();
    }
  );

  $("#work-img09").mouseover(
    function(){
      $("#work-des09").fadeIn();
    }
  );
  $("#work-img09").mouseout(
    function(){
      $("#work-des09").fadeOut();
    }
  );
}
