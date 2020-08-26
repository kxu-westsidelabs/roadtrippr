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
const {Client, Status} = require("@googlemaps/google-maps-services-js");
const fs = require("fs");

// this will come from Form input - selected using Places API
/*
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
*/
var points = [
    "Atlanta, GA",
    "Louisville, KY",
    "Chicago, IL",
    "Saint Paul, MN",
    "Grand Tetons, WY",
    "Seattle, WA",
    "Bend, OR",
    "Los Angeles, CA"
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

        var filename = "response.js";
        var text = "var response = " + JSON.stringify(r.data) + ";";
        fs.writeFile(filename, text, function(err) {
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
