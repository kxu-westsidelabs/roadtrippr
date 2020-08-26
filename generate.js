
/**
 * Inputs:
 *  - List of Addresses
 *
 * Outputs:
 *  - geoJSON with Markers
 *  - geoJSON for roadtrip with Linestring
 *  - trip stats like total mileage
 *
 * Error Handling:
 *  - What happens when unable to find directions?
 */

const MapboxPolyline = require("@mapbox/polyline");
const {Client, Status} = require("@googlemaps/google-maps-services-js");
const fs = require("fs");

// this will come from Form input - selected using Places API
var points = [
    "Atlanta, GA",
    "Williams Junction, AR",
    "Lake Meredith, TX",
    "Grand Canyon National Park, AZ",
    "Death Valley National Park, CA",
    "Kernville, CA",
    "Big Sur, CA",
    "1020 6th St, Santa Monica, CA"
];

const client = new Client({});
client
    .directions({
        params: {
            origin: points.shift(),
            destination: points.pop(),
            waypoints: points,
            key: process.env.GOOGLE_API_KEY
        },
        timeout: 1000,  // milliseconds
    })
    .then((r) => {
        console.log("GET /maps/api/directions success - generating geoJSON...");
        console.log("dumpign results", r.data);

        var gd = new GDirectionsParser(r.data);
        //var waypoints = gd.getWaypointsGeoJSON();
        //console.log("waypoints:", JSON.stringify(waypoints));

        //var route = gd.getRouteGeoJSON();
        //console.log("route:", JSON.stringify(route));

        var stats = gd.getStats();
        console.log("stats:", JSON.stringify(stats));
    })
    .catch(err => {
        console.log("ERR:", err);
        console.log("ERR data:", err.data);
    });

    /*
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
    */


class GDirectionsParser {
    constructor(response) {
        this.response = response;
        this.stats = {};
    }

    isValid() {
        return this.response.status === "OK";
    }

    getBoundingBox() {
        return this.response.routes[0].bounds;
    }

    getWaypointsGeoJSON() {
        var waypoints = {
            "type": "FeatureCollection",
            "features": []
        };

        this.response.routes[0].legs.forEach(function(leg) {
            waypoints.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        leg.start_location.lng,
                        leg.start_location.lat
                    ]
                },
                // TODO: change image
                "properties": {
                    "address": leg.start_address,
                    "distance_to_next": leg.distance.text,
                    "image_url": "https://www.nps.gov/lamr/planyourvisit/images/lake-Meredith-Fritch-fortress.jpg?maxwidth=650&autorotate=false"
                }
            });
        }, waypoints);

        return waypoints;
    };

    getRouteGeoJSON() {
        // TODO: Change pickuptime and dropofftime
        var route = {
            "type": "Feature",
            "properties": {
                "pickuptime": "10/3/13 1:21",
                "dropofftime": "10/3/13 2:05"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": []
            }
        }

        // TODO: use leg-specific polylines
        var polyline = this.response.routes[0].overview_polyline.points;
        MapboxPolyline.decode(polyline).forEach(function(coord) {
            route.geometry.coordinates.push(coord.reverse());
        }, route);

        return route;
    }

    getStats() {
        var stats = {
            distance_meters: 0,
            time_seconds: 0
        };
        this.response.routes[0].legs.forEach(function(leg) {
            stats.distance_meters += leg.distance.value;
            stats.time_seconds += leg.duration.value;
        }, stats);

        stats.human_time = this._convertSecondsToHumanReadableTime(
            stats.time_seconds
        );
        stats.human_distance = Math.round(stats.distance_meters * 0.000621371192) + " miles";

        return stats;
    }

    _convertSecondsToHumanReadableTime(timeSeconds) {
        var seconds = parseInt(timeSeconds, 10);
        var days = Math.floor(seconds / (3600*24));
        seconds -= days*3600*24;
        var hrs = Math.floor(seconds / 3600);
        seconds -= hrs*3600;
        var mnts = Math.floor(seconds / 60);
        seconds -= mnts*60;

        return days+" days, "+hrs+" Hrs, "+mnts+" Minutes, "+seconds+" Seconds";
    }
}

