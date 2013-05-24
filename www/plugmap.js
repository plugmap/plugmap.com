/*global L*/

"use strict";

var plugicon = L.icon({iconUrl:'happy-plug-icon.svg',
  iconSize: L.point(29,25)});

var map = L.mapbox.map('map', 'stuartpb.map-6cgn20kd')
  .setView([47.61118157075462, -122.33769352761296], 16);
  
function plugInfo(plug){
  return '<h2 class="venuename">' + plug.venue + '</h2>'
}
  
function addPlugMarker(plug){
  var mrkr = L.marker(plug.latlng,{icon:plugicon});
  mrkr.bindPopup(plugInfo(plug));
  mrkr.addTo(map);
}

function getPlugs(cb) {
  //pretend API call
  return cb(null, [
    {
      latlng: [47.616722, -122.3461743],
      venue: "Uptown Espresso",
      outlets: 2
    },  
    {
      latlng: [47.616727, -122.3461741],
      venue: "Uptown Espresso",
      outlets: 2
    },  
    {
      latlng: [47.616723, -122.3461749],
      venue: "Uptown Espresso",
      outlets: 2
    },  
    {
      latlng: [47.616728, -122.3461745],
      venue: "Uptown Espresso",
      outlets: 2
    },  
    {
      latlng: [47.616721, -122.3461743],
      venue: "Uptown Espresso",
      outlets: 2
    },  
    {
      latlng: [47.61629637427943, -122.34523057937622],
      venue: "Starbucks",
      outlets: 2
    }
  ]);
}

var markers = new L.MarkerClusterGroup({
  iconCreateFunction: function(cluster) {
    return new L.DivIcon({ className: 'plug-cluster', iconSize: L.point(29,25),
      html: '<span class="count">' + cluster.getChildCount() + '</span>' });
  }
});

getPlugs(function(err,plugs){
  plugs.forEach(function (plug){
    var marker = L.marker(plug.latlng,{icon:plugicon});
    marker.bindPopup(plug.venue);
    markers.addLayer(marker);
  });
  map.addLayer(markers);
});

function gimmeCoords(){
map.on('click',function(evt){
      var mrkr = L.marker(evt.latlng,{icon:plugicon});
      mrkr.bindPopup(evt.latlng.lat+', '+evt.latlng.lng);
      mrkr.addTo(map);
    });
}