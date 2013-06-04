/*global L Modernizr*/

"use strict";

var plugicon = L.icon({iconUrl:'/happy-plug-icon.svg',
  iconSize: [29.25,29.25]});

var map = L.map('map')
  .setView([47.61118157075462, -122.33769352761296], 16)
  .addLayer(L.mapbox.tileLayer('stuartpb.map-6cgn20kd', {
    maxZoom: 19,
    detectRetina: true,
    retinaVersion: 'stuartpb.map-twpbs0dt'
  }));

  map.attributionControl.setPrefix('<a href="/about">About</a>');

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

  // Either the plugin defaults to assuming your maxZoom is 18, or the
  // mapbox tile constructor wasn't setting maxZoom correctly. Either way,
  // without setting this, the plugin defaults to disabling clustering at
  // level 19, and that's no good. Setting it to 20 makes it so clustering
  // doesn't get disabled at our highest zoom level (19).
  disableClusteringAtZoom: 20,

  //Space the spiderfied plugs out a bit.
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
  var props = plug.properties;
  return '<a href="/plug/' + plug._id + '" class="plug-popup">'
    + '<img class="popup-image" src="' + props.images[360] + '">'
    + '<h2 class="popup-venuename">' + htContent(props.venue) + '</h2>'
    + '<h3 class="popup-plugname">' + htContent(props.name) + '</h3>'
    + '<a class="popup-ownerlink" href="/users/' + props.owner.username
    + '"><img class="popup-owneravatar" src="//gravatar.com/avatar/'
    + props.owner.emailMD5 + '?s=44?" alt="mapped by ' + props.owner.username
    + '"></a>';
}

function addPlugMarker(plug){
  var mrkr = L.marker([
    plug.geometry.coordinates[1],
    plug.geometry.coordinates[0]],
    {icon:plugicon});
  mrkr.bindPopup(plugInfo(plug),{
    closeButton: false,
    maxWidth: 179, //workaround for bug in Leaflet width calculation
    offset: [0,0]});
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
