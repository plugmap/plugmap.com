/*global L filepicker*/

"use strict";

// set up filepicker stuff
filepicker.setKey('AsgVwvIYmRdmv5DsVcXeFz');

// set up Leaflet stuff
var pluglong = document.getElementById('pluglong');
var pluglat = document.getElementById('pluglat');
var youAreHere = null;
var pin = null;

var dropmap = L.map('dropmap',{doubleClickZoom: false})
  .setView([47.61118157075462, -122.33769352761296], 16)
  .addLayer(L.tileLayer(
    'http://{s}.tiles.mapbox.com/v3/{username}.{map}/{z}/{x}/{y}.png',
    { subdomains: 'abcd',
      username: 'stuartpb',
      map: L.Browser.retina ? 'map-twpbs0dt' : 'map-6cgn20kd',
      detectRetina: true,
      maxZoom: 19,
    }));

dropmap.attributionControl.setPrefix('<a href="/about">About</a>');

dropmap.on('click',function(evt){
  var pos = evt.latlng;
  if(!pin){
    pin = L.marker([pos.lat, pos.lng], {zIndexOffset: 1});
    pin.addTo(dropmap);
  } else {
    pin.setLatLng([pos.lat, pos.lng]);
  }
  pluglong.value = pos.lng;
  pluglat.value = pos.lat;
});

if(navigator.geolocation) {
  navigator.geolocation.watchPosition(function(geo){
    var pos = geo.coords;
    if(!youAreHere){
      youAreHere = L.circle(
        [pos.latitude, pos.longitude], pos.accuracy,
        {color: '#03f', weight: 1});
      youAreHere.addTo(dropmap);
    } else {
      youAreHere.setLatLng([pos.latitude, pos.longitude]);
      youAreHere.setRadius(pos.accuracy);
    }

    if(!pin){
      dropmap.panTo([pos.latitude, pos.longitude]);
    }
  }, null, {enableHighAccuracy: true});
}