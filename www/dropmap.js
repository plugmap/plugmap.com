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
  .addLayer(L.mapbox.tileLayer('stuartpb.map-6cgn20kd', {
    detectRetina: true,
    maxZoom: 19,
    retinaVersion: 'stuartpb.map-twpbs0dt'
  }));

  dropmap.attributionControl.setPrefix('<a href="/about">About</a>');

var mrkr = L.marker(
  [47.61118157075462, -122.33769352761296],
  {
    zIndexOffset: 1,
    draggable: true
  });

mrkr.on('dragend',function(evt){
  seal = false;
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