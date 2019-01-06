<script type="text/javascript">
  window.onload = function(){
    let ParentTargets = document.getElementsByClassName("work-img");
    let Targets = document.getElementsByClassName("work-des");

    function FuncOver(event){
      Targets[event.target.eventParam].style.opacity = 1.0;
    }

    function FuncOut(event){
      Targets[event.target.eventParam].style.opacity = 0.0;
    }

    for(var i = 0; i < ParentTargets.length; i++){
      var index = i;
      ParentTargets[i].addEventListener("mouseover",FuncOver, false);
      ParentTargets[i].eventParam = index;

      ParentTargets[i].addEventListener("mouseout",FuncOut, false);
      ParentTargets[i].eventParam = index;
    }
  }
</script>
