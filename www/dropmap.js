/*global L Modernizr*/

"use strict";

var pluglong = document.getElementById('pluglong');
var pluglat = document.getElementById('pluglat');
var seal = true;
var youAreHere = null;
var youAreHereCircle = null;

var dropmap = L.mapbox.map('dropmap', 'stuartpb.map-6cgn20kd')
  .setView([47.61118157075462, -122.33769352761296], 16);

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

if(Modernizr.geolocation) {
  navigator.geolocation.watchPosition(function(pos){
    if(!youAreHere){
      youAreHere = L.marker(
        [pos.latitude, pos.longitude],
        { draggable: true,
          icon: L.divIcon({
            iconSize: [16, 16],
            className: 'you-are-here-icon',
            html: '&#x25C9;'})
        });
      youAreHere.addTo(dropmap);
      youAreHereCircle = L.circle(
        [pos.latitude, pos.longitude], pos.accuracy,
        {color: '#f00'});
      youAreHereCircle.addTo(dropmap);

    } else {
      youAreHere.setLatLng([pos.latitude, pos.longitude]);
      youAreHereCircle.setLatLng([pos.latitude, pos.longitude]);
      youAreHereCircle.setRadius(pos.accuracy);
    }

    if(seal){
      mrkr.setLatLng([pos.latitude, pos.longitude]);
      dropmap.panTo([pos.latitude, pos.longitude]);
    }
  }, null, {enableHighAccuracy: true});
}