class GDirectionsParser {
    constructor(response) {
        this.response = response;
        this.stats = {};
    }

    isValid() {
        return this.response.status === "OK";
    }

    getBoundingBox() {
        var sw = this.response.routes[0].bounds.southwest;
        var ne = this.response.routes[0].bounds.northeast;
        return [[sw.lng, sw.lat], [ne.lng, ne.lat]];
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
        // TODO: use polyline.toGeoJSON()
        var polylinePoints = this.response.routes[0].overview_polyline.points;
        polyline.decode(polylinePoints).forEach(function(coord) {
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
