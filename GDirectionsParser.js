class GDirectionsParser {
    constructor(response) {
        this.response = response;
        this.stats = {};
    }

    isValid() {
        return this.response.status === "OK";
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
