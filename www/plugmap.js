/*global L Modernizr*/

"use strict";

var plugicon = L.divIcon({ className: 'plug-icon', iconSize: [32,32]});

var map = L.map('map')
  .addLayer(L.tileLayer(
    'http://{s}.tiles.mapbox.com/v3/{username}.{map}/{z}/{x}/{y}.png',
    { subdomains: 'abcd',
      username: 'stuartpb',
      map: L.Browser.retina ? 'map-twpbs0dt' : 'map-6cgn20kd',
      detectRetina: true,
      maxZoom: 19,
    }));

if (!map.restoreView()) {
  map.setView([47.61118157075462, -122.33769352761296], 16);
}

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
      return L.divIcon({ className: 'plug-icon', iconSize: [32,32],
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
    + '</a>'
    + '<div class="popup-top">'
    + '<a href="/plug/' + plug._id + '" class="popup-upvolt-count">'
    + '<span class="icon-upvolt popup-upvolt-icon"></span> 0</a></div>'
    + '<a class="popup-ownerlink" href="/user/' + props.owner.username
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
    offset: L.point(0,0)});
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
