/*global L filepicker*/

"use strict";

// set up filepicker stuff
filepicker.setKey('AsgVwvIYmRdmv5DsVcXeFz');

// set up Leaflet stuff
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

if(navigator.geolocation) {
  navigator.geolocation.watchPosition(function(geo){
    var pos = geo.coords;
    if(!youAreHere){
      youAreHere = L.marker(
        [pos.latitude, pos.longitude],
        { draggable: true,
          icon: L.divIcon({
            className: 'you-are-here-icon',
            html: 'you are here'})
        });
      //youAreHere.addTo(dropmap);
      youAreHereCircle = L.circle(
        [pos.latitude, pos.longitude], pos.accuracy,
        {color: '#03f', weight: 1});
      youAreHereCircle.addTo(dropmap);

      //if the user has already started dragging the marker
      /*if (!seal){
        var ll = mrkr.getLatLng();
        dropmap.fitBounds([
          [Math.min(pos.latitude - pos.accuracy, ll.lat),
            Math.min(pos.longitude - pos.accuracy, ll.lng)],
          [Math.max(pos.latitude + pos.accuracy, ll.lat),
            Math.max(pos.longitude + pos.accuracy, ll.lng)]
        ]);
      }*/
    } else {
      youAreHere.setLatLng([pos.latitude, pos.longitude]);
      youAreHereCircle.setLatLng([pos.latitude, pos.longitude]);
      youAreHereCircle.setRadius(pos.accuracy);
    }

    if(seal){
      mrkr.setLatLng([pos.latitude, pos.longitude]);
      pluglong.value = pos.longitude;
      pluglat.value = pos.latitude;
      dropmap.panTo([pos.latitude, pos.longitude]);
    }
  }, null, {enableHighAccuracy: true});
}