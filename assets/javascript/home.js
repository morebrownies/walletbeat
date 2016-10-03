// if (window.location.protocol != "https:")
//     window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);

function checkKey(key){
  if ((key.length >= 27 && key.length <= 34) && (key.charAt(0) === "1" || key.charAt(0) === "3" ) ){
    return true;
  }else{
    return false;
  }
}

function createDashboard() {
  if ( checkKey($('.input-public-key').val()) ){
    localStorage.setItem('create-dashboard', true);
    window.location.href = "dashboard.html?keys=" + $('.input-public-key').val();
  }else{
    $(".input-public-key").effect("shake", {
      times: 2,
      distance: 6
    }, 500); 
  }      
}

function initialLoad(){
  localStorage.setItem('added-second-wallet', false);
  $(".hero").delay(200).fadeIn("slow");
}

$(function() {
  $(document).keyup(function(e) {
    if (e.keyCode == 13 && $('.input-public-key').is(":focus")){
      createDashboard();
    }
  });

  $("#button-create").click(function(){
    createDashboard();
  });

  initialLoad();
});