/*global L Modernizr*/

"use strict";

var plugicon = L.icon({iconUrl:'happy-plug-icon.svg',
  iconSize: L.point(29,25)});

var map = L.mapbox.map('map', 'stuartpb.map-6cgn20kd')
  .setView([47.61118157075462, -122.33769352761296], 16);

function plugInfo(plug){
  return '<h2 class="venuename">' + plug.venue + '</h2>';
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
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34617471694942, 47.6167248819164]
      },
      properties: {
        venue: "Uptown Espresso",
        sockets: 2
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34617471694942, 47.6167248819164]
      },
      properties: {
        venue: "Uptown Espresso",
        sockets: 2
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34617471694942, 47.6167248819164]
      },
      properties: {
        venue: "Uptown Espresso",
        sockets: 2
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34617471694942, 47.6167248819164]
      },
      properties: {
        venue: "Uptown Espresso",
        sockets: 2
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34617471694942, 47.6167248819164]
      },
      properties: {
        venue: "Uptown Espresso",
        sockets: 2
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34439909458159, 47.616864100941655]
      },
      properties: {
        venue: "Starbucks",
        sockets: 2
      }
    }
  ]);
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
        return new L.DivIcon({ className: 'plug-cluster', iconSize: L.point(29,25),
          html: '<span class="count">' + cluster.getChildCount() + '</span>' });
    }
});

getPlugs(function(err,plugs){
  plugs.forEach(function (plug){
    var marker = L.marker([plug.geometry.coordinates[1],plug.geometry.coordinates[0]],{icon:plugicon});
    marker.bindPopup(plug.properties.venue);
    markers.addLayer(marker);
  });
  map.addLayer(markers);
});

function locationlessLocator() {

}

function positionalLocator(position) {

}

function locateMe() {
  if(Modernizr.geolocation) {
    navigator.geolocation.getCurrentPosition(
      positionalLocator,locationlessLocator,{enableHighAccuracy:true});
  } else {
    locationlessLocator();
  }
}

function gimmeCoords(){
  map.on('click',function(evt){
    var mrkr = L.marker(evt.latlng,{icon:plugicon});
    mrkr.bindPopup(evt.latlng.lat+', '+evt.latlng.lng);
    mrkr.addTo(map);
  });
}