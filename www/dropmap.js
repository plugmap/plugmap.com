/*global L filepicker*/

"use strict";

// set up filepicker stuff
filepicker.setKey('AsgVwvIYmRdmv5DsVcXeFz');

// set up Leaflet stuff
var pluglong = document.getElementById('pluglong');
var pluglat = document.getElementById('pluglat');
var seal = true;
var youAreHere = null;

var dropmap = L.map('dropmap')
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
  seal = false;
  var pos = evt.latlng;
  mrkr.setLatLng([pos.lat, pos.lng]);
  pluglong.value = pos.lng;
  pluglat.value = pos.lat;
});

var mrkr = L.marker(
  [47.61118157075462, -122.33769352761296],
  {
    zIndexOffset: 1,
    draggable: true
  });

mrkr.on('dragstart',function(evt){
  seal = false;
});
mrkr.on('dragend',function(evt){
  var ll = mrkr.getLatLng();
  pluglong.value = ll.lng;
  pluglat.value = ll.lat;
});

mrkr.addTo(dropmap);

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

    if(seal){
      mrkr.setLatLng([pos.latitude, pos.longitude]);
      pluglong.value = pos.longitude;
      pluglat.value = pos.latitude;
      dropmap.panTo([pos.latitude, pos.longitude]);
    }
  }, null, {enableHighAccuracy: true});
}