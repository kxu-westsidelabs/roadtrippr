var coordLat = 37.780;
var coordLong = -122.4304;
var zoom = 13;

// TODO: don't commit this!
var mapboxApiKey = "pk.eyJ1Ijoia3h1MTYiLCJhIjoiY2p5NXh1bzZqMGNrMzNkbzB1bjlsazluaCJ9.LWKf9jAXZmDmKgAWA-IS9g";

// create the Leaflet map using Mapbox tiles
// initialize map using center coordinates and zoom leve
var map = L.map('mapid').setView([coordLat, coordLong], zoom);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: mapboxApiKey
}).addTo(map);

// append a SVG to the Leaflet overlay pane
// add a <g> group, which will group together child elements so that
// tranformations get applied to all children
var mbOverlayPane = map.getPanes().overlayPane;
var svg = d3.select(mbOverlayPane).append("svg");
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

// TODO: MOVE THIS INTO A BACKEND ENDPOINT
var geoJson = {
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type": "Feature", "properties": { "latitude": 37.7852113, "longitude": -122.4103136, "time": 1, "id": "route1", "name":"Ellis St." }, "geometry": { "type": "Point", "coordinates": [-122.4103, 37.78521] }},

        { "type": "Feature", "properties": { "latitude": 37.8074, "longitude": -122.4304, "time": 2, "id": "route1", "name":"Fort Mason Center"  }, "geometry": { "type": "Point", "coordinates": [ -122.4304, 37.8074 ] 
        }}
    ]
};



// since we're manually specifying the JSON, we don't need to use d3.json()

// use D3 to load up our Points
//d3.json(geoJson, function(collection) {
    //console.log(collection);
//});
