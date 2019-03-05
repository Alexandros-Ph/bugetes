module.exports = async function geocoding(address){

  var loopback = require('loopback');
  var NodeGeocoder  = require('node-geocoder');
  var resultPoint;
  var options ={
    provider:'google',
    httpAdapter: 'https',
    apiKey: 'AIzaSyCQeSlLD3EuBqByQIXEsYNaHn3Augdfm70',
    formater: null
  };

  var geocoder = NodeGeocoder(options);
  await geocoder.geocode(address, function(err, data){
    if(err){
      console.log(err);
      return;
      // error code
    }
    //
    //console.log(data);
    //console.log(data[0].latitude);

    var tempPoint = new loopback.GeoPoint({lat: parseFloat(data[0].latitude),lng: parseFloat(data[0].longitude)});
    resultPoint = tempPoint;

  });

  return resultPoint;

};
