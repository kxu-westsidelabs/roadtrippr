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
const { Client, Status } = require("@googlemaps/google-maps-services-js");

// this will come from Form input - selected using Places API
const points = [
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
client.directions({
    params: {
        origin: points.shift(),
        destination: points.pop(),
        waypoints: points,
        key: process.env.GOOGLE_API_KEY
    },
    timeout: 5000,  // milliseconds
})
.then((r) => {
    //console.log(JSON.stringify(r.data));
    console.log(JSON.stringify(r.data, null, 2));
})
.catch(err => {
    console.log("ERR:", err);
});
