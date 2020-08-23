/**
 * TrailBlazrr
 */
function getMapboxTiles() {
    return L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        accessToken: mb,
        attribution: '© <a href="https://www.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        tileSize: 512,
        zoomOffset: -1
    });
}

/**
 * Convert lat/long --> SVG coordinates
 * Accepts a point from GeoJSON
 */
function applyLatLngToLayer(d) {
    var y = d.geometry.coordinates[1];
    var x = d.geometry.coordinates[0];
    return map.latLngToLayerPoint(new L.LatLng(y, x));
}

/**
 * Use Leaflet to implmenet a D3 geometric transformation
 *
 * latLgnToLayerPoint is a Leaflet ocnversion method that returns
 * the map layer point that corresponds to a given geographical
 * coordinate.
 *
 * This is useful for placing overlays on a map
 */
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function render(collection) {
    console.log("dumping collection", collection);

    //stream transform. transforms geometry before passing it to
    // listener. Can be used in conjunction with d3.geo.path
    // to implement the transform.
    var transform = d3.geo.transform({
        point: projectPoint
    });

    //d3.geo.path translates GeoJSON to SVG path codes.
    //essentially a path generator. In this case it's
    // a path generator referencing our custom "projection"
    // which is the Leaflet method latLngToLayerPoint inside
    // our function called projectPoint
    var d3path = d3.geo.path().projection(transform);
    //console.log("d3path", d3path);

    // Define a function that generates a line from input points
    //
    // Input points need to be converted from Lat/Long to Map Units
    // via applyLatLngToLayer
    var toLine = d3.svg.line()
        .interpolate("linear")
        .x(function(d) {
            return applyLatLngToLayer(d).x
        })
        .y(function(d) {
            return applyLatLngToLayer(d).y
        });
    //console.log("toLine", toLine);

    // Append features to Group element
    var ptFeatures = g.selectAll("circle")
        .data(collection.features)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("class", "waypoints");
    console.log("ptFeatures", ptFeatures);

    // Make the points into a single line/path
    var linePath = g.selectAll(".lineConnect")
        .data([collection.features])
        .enter()
        .append("path")
        .attr("class", "lineConnect");

    // Circle that travels along the Path
    var marker = g.append("circle")
        .attr("r", 10)
        .attr("id", "marker")
        .attr("class", "travelMarker");

    var len = collection.features.length;
    var originANDdestination = [
        collection.features[0],
        collection.features[len-1]
    ];

    var begend = g.selectAll(".drinks")
        .data(originANDdestination)
        .enter()
        .append("circle", ".drinks")
        .attr("r", 5)
        .style("fill", "red")
        .style("opacity", "1");

    // Add labels to starting and ending coordinates
    var text = g.selectAll("text")
        .data(originANDdestination)
        .enter()
        .append("text")
        .text(function(d) {
            return d.properties.name
        })
        .attr("class", "locnames")
        .attr("y", function(d) {
            return -10
        })

    // when the user zooms in or out you need to reset
    // the view
    map.on("zoom", reset);

    // this puts stuff on the map!
    reset();
    transition();

    /**
     * Reset SVG to Features
     */
    function reset() {
        var bounds = d3path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        // here you're setting some styles, width, heigh etc
        // to the SVG. Note that we're adding a little height and
        // width because otherwise the bounding box would perfectly
        // cover our features BUT... since you might be using a big
        // circle to represent a 1 dimensional point, the circle
        // might get cut off.

        text.attr("transform",
            function(d) {
                return "translate(" +
                    applyLatLngToLayer(d).x + "," +
                    applyLatLngToLayer(d).y + ")";
            });


        // for the points we need to convert from latlong
        // to map units
        begend.attr("transform",
            function(d) {
                return "translate(" +
                    applyLatLngToLayer(d).x + "," +
                    applyLatLngToLayer(d).y + ")";
            });

        ptFeatures.attr("transform",
            function(d) {
                return "translate(" +
                    applyLatLngToLayer(d).x + "," +
                    applyLatLngToLayer(d).y + ")";
            });

        // again, not best practice, but I'm harding coding
        // the starting point
        marker.attr("transform",
            function() {
                var y = collection.features[0].geometry.coordinates[1]
                var x = collection.features[0].geometry.coordinates[0]
                return "translate(" +
                    map.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
                    map.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
            });


        // Setting the size and location of the overall SVG container
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
            .attr("height", bottomRight[1] - topLeft[1] + 120)
            .style("left", topLeft[0] - 50 + "px")
            .style("top", topLeft[1] - 50 + "px");


        // linePath.attr("d", d3path);
        linePath.attr("d", toLine)
        // ptPath.attr("d", d3path);
        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
    }

    // the transition function could have been done above using
    // chaining but it's cleaner to have a separate function.
    // the transition. Dash array expects "500, 30" where
    // 500 is the length of the "dash" 30 is the length of the
    // gap. So if you had a line that is 500 long and you used
    // "500, 0" you would have a solid line. If you had "500,500"
    // you would have a 500px line followed by a 500px gap. This
    // can be manipulated by starting with a complete gap "0,500"
    // then a small line "1,500" then bigger line "2,500" and so
    // on. The values themselves ("0,500", "1,500" etc) are being
    // fed to the attrTween operator
    function transition() {
        linePath.transition()
            .duration(7500)
            .attrTween("stroke-dasharray", tweenDash)
            //.each("end", function() {
                //d3.select(this).call(transition);   // infinite loop
            //});
    }

    // this function feeds the attrTween operator above with the
    // stroke and dash lengths
    function tweenDash() {
        return function(t) {
            //total length of path (single value)
            var l = linePath.node().getTotalLength();

            // this is creating a function called interpolate which takes
            // as input a single value 0-1. The function will interpolate
            // between the numbers embedded in a string. An example might
            // be interpolatString("0,500", "500,500") in which case
            // the first number would interpolate through 0-500 and the
            // second number through 500-500 (always 500). So, then
            // if you used interpolate(0.5) you would get "250, 500"
            // when input into the attrTween above this means give me
            // a line of length 250 followed by a gap of 500. Since the
            // total line length, though is only 500 to begin with this
            // essentially says give me a line of 250px followed by a gap
            // of 250px.
            interpolate = d3.interpolateString("0," + l, l + "," + l);
            //t is fraction of time 0-1 since transition began
            var marker = d3.select("#marker");

            // p is the point on the line (coordinates) at a given length
            // along the line. In this case if l=50 and we're midway through
            // the time then this would 25.
            var p = linePath.node().getPointAtLength(t * l);

            //Move the marker to that point
            marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
            console.log(interpolate(t))
            return interpolate(t);
        }
    } //end tweenDash

}

var pointsFile = "roadtrip.json";

var map, svg, g;
d3.json(pointsFile, function(collection) {

    // center Map on middle Waypoint
    var md = Math.round(collection.features.length / 2);
    var coordCenter = collection.features[md].geometry.coordinates;
    var zoom = 9;

    var mapboxTiles = getMapboxTiles();
    map = L.map('map')
      .addLayer(mapboxTiles)
      .setView([coordCenter[1], coordCenter[0]], zoom);

    // add SVG to Leaflet overlay pane
    svg = d3.select(map.getPanes().overlayPane).append("svg");

    // add g (group) element to SVG
    // leaflet-zoom-hide is to prevent phantom SVG artificts during zoom in/out
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    render(collection);
});
