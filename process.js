/**************
 * process.js
 *
 * - Look at the /photos directory
 * - For each photo
 *      - Extract the lat/long coordinates from each
 * - Create a request to Google Maps API
 *      - Each coordinate is a waypoint (up to 10)
 * - Send the Request and pull the `overview_polyline` string
 * - Decode the `overview_polyline` using Mapbox polyline utility
 * - Create the geoJSON object that will be used to render the Map
 *
 **************/

const MapboxPolyline = require("@mapbox/polyline");
const {Client, Status} = require("@googlemaps/google-maps-services-js");
const fs = require("fs");

var origin = "33.719,-84.414";
var destination = "34.039,-118.580";

const client = new Client({});
client
    .directions({
        params: {
            origin: origin,
            destination: destination,
            key: process.env.GOOGLE_API_KEY
        },
        timeout: 1000,  // milliseconds
    })
    .then((r) => {
        console.log("GET /maps/api/directions success - generating geoJSON...");
        return decodeAndGenerateGeoJSON(
            r.data.routes[0].overview_polyline.points
        );
    })
    .then(geoJSON => {
        console.log("saving geoJSON to file...");

        var filename = "points.geojson";
        fs.writeFile(filename, JSON.stringify(geoJSON), function(err) {
            if (err) {
                return console.log("ERR with file write", err);
            }
            console.log(`created ${filename}`);
        });
    })
    .catch(err => {
        console.log("ERR:", err);
    });


function decodeAndGenerateGeoJSON(polyline) {
    var geoJSON = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        },
        "features": []
    };

    MapboxPolyline.decode(polyline).forEach(function(coord, idx) {
        geoJSON.features[idx] = coordToFeature(coord, idx);
    }, geoJSON);

    return geoJSON;
}

function coordToFeature(coord, idx) {
    return {
        "type": "Feature",
        "properties": {
            "latitude": coord[0],
            "longitude": coord[1],
            "time": idx,
            "id": "route1",
            "name": "whatup"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [coord[1], coord[1]]
        }
    };
}
