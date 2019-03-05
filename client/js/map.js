function initMap(){

  var x = document.getElementById("fakex").innerText
  var y = document.getElementById("fakey").innerText
  var listx = document.getElementsByClassName('shopx')
  var listy = document.getElementsByClassName('shopy')

  var myLatLng = {lat: parseFloat(x), lng: parseFloat(y)};

    var map = new google.maps.Map(document.getElementById('gmap_canvas'), {
      zoom: 13,
      center: myLatLng
    });

    for (var i = 0; i < listx.length; i++) {
      var shopx = listx[i].innerText;
      var shopy = listy[i].innerText;

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(shopx, shopy),
        map: map,
      });
    }


  }
