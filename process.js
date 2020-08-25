/**************
 * > GOOGLE_API_KEY=*** node process.js
 *
 * - Create a request to Google Maps API
 *      - Each coordinate is a waypoint (up to 10)
 * - Send the Request and pull the `overview_polyline` string
 * - Decode the `overview_polyline` using Mapbox polyline utility
 * - Create the geoJSON object that will be used to render the Map
 *      - Save results to file
 *
 **************/

const MapboxPolyline = require("@mapbox/polyline");
const {Client, Status} = require("@googlemaps/google-maps-services-js");
const fs = require("fs");

var origin = "33.719,-84.414";                      // ATL --> LA
var destination = "34.039,-118.580";

const client = new Client({});
client
    .directions({
        params: {
            origin: origin,
            destination: destination,
            waypoints: [
                "34.8814952,-92.78227652",          // Arkansas - Williams Junction
                "35.6630437,-101.6226556",          // Lake Meredith
                "36.0591321,-112.1136936",          // Grand Canyon
                "36.3274844,-116.8196691",          // Death Valley
                "35.7331104,-118.5046195",          // Kernville
                "36.0049758,-121.4589416"           // Big Sur - Nacimiento
            ],
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
        var filename = "roadtrip.json";
        console.log(`Saving geoJSON in ${filename}`);

        fs.writeFile(filename, JSON.stringify(geoJSON), function(err) {
            if (err) {
                return console.log("ERR with file write", err);
            }
            console.log(`created ${filename}`);
        });
    })
    .catch(err => {
        console.log("ERR:", err);
        console.log("ERR data:", err.data);
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
        geoJSON.features[idx] = coordToFeature(coord);
    }, geoJSON);

    return geoJSON;
}

function coordToFeature(coord) {
    return {
        "type": "Feature",
        "properties": {
            "latitude": coord[0],
            "longitude": coord[1],
            "name": "point"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [coord[1], coord[0]]
        }
    };
}
