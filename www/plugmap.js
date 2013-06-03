/*global L Modernizr*/

"use strict";

var plugicon = L.icon({iconUrl:'happy-plug-icon.svg',
  iconSize: [29.25,29.25]});

var map = L.mapbox.map('map', 'stuartpb.map-6cgn20kd')
  .setView([47.61118157075462, -122.33769352761296], 16);

function getPlugs(cb) {
  var req = new XMLHttpRequest();
  req.open('GET', '/api/v0/plugs', true);
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
       if(req.status == 200)
        cb(null,JSON.parse(req.responseText));
    }
  };
  req.send(null);
}

var markers = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,

    // For some reason I don't understand, that doesn't occur in the example
    // cases for this plugin, leaving this unset results in clustering being
    // disabled at the lowest zoom level.
    // Worth investigating, later.
    disableClusteringAtZoom: 20,

    spiderfyDistanceMultiplier: 1.5,

    iconCreateFunction: function(cluster) {
        return new L.DivIcon({ className: 'plug-cluster', iconSize: [29.25,29.25],
          html: '<span class="count">' + cluster.getChildCount() + '</span>' });
    }
});

function htContent(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
}

function plugInfo(plug){
  return '<a href="/plug/' + plug._id + '" class="plug-popup">'
    + '<img class="popup-image" src="' + plug.properties.images[360] + '">'
    + '<h2 class="popup-venuename">' + htContent(plug.properties.venue) + '</h2>'
    + '<h3 class="popup-plugname">' + htContent(plug.properties.name) + '</h3>'
    + '</a>';
}

function addPlugMarker(plug){
  var mrkr = L.marker([
    plug.geometry.coordinates[1],
    plug.geometry.coordinates[0]],
    {icon:plugicon});
  mrkr.bindPopup(plugInfo(plug),{offset:[0,0]});
  mrkr.addTo(markers);
}

getPlugs(function(err,plugs){
  plugs.forEach(addPlugMarker);
  map.addLayer(markers);
});

function locationlessLocator() {

}

function positionalLocator(geo) {
  var gc = geo.coords;
  map.panTo([gc.latitude, gc.longitude]);
}

function locateMe() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      positionalLocator,locationlessLocator,{enableHighAccuracy:true});
  } else {
    locationlessLocator();
  }
}

//this should be handled with a button call later
locateMe();
