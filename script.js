// update data for one frame
function updateData(trip, incrementLength, counter, frames) {

    console.log(counter)
    // length to visualize for this frame
    const frameLength = incrementLength * counter;

    // calculate where to place the marker
    const pointAlong = turf.along(trip, frameLength);

    // cut the line at the point
    const lineAlong = turf.lineSplit(trip, pointAlong).features[0];

    map.getSource('pointAlong').setData(pointAlong);
    map.getSource('lineAlong').setData(lineAlong);
    map.flyTo({center: pointAlong.geometry.coordinates});

    if (counter === 0) map.getSource('startPoint').setData(pointAlong);
    if (counter === frames) {
        map.getSource('endPoint').setData(pointAlong);
        map.getSource('pointAlong').setData({
            type: 'FeatureCollection',
            features: [],
        });
    }
}

function animateTrip(trip) {

    const { pickuptime, dropofftime } = trip.properties
    // calculate real world duration of trip
    const start = moment(pickuptime);
    const end = moment(dropofftime);
    const duration = end.diff(start, 'seconds');
    const multiplier = 300;
    const vizDuration = duration * (1 / multiplier)
    const fps = 50

    const frames = parseInt(fps * vizDuration);

    console.log(`Trip Duration is ${duration} seconds`)
    console.log(`Viz Duration is ${vizDuration} seconds`)
    console.log(`Total Frames at ${fps}fps is ${frames}`)

    // divide length and duration by number of frames
    const tripLength = turf.length(trip);
    const incrementLength = tripLength / frames;
    const interval = (vizDuration / frames) * 1000;

    // updateData at the calculated interval
    let counter = 0
    console.log(frames)
    const dataInterval = setInterval(() => {
        updateData(trip, incrementLength, counter, frames)
        if (counter === frames + 1) {
            clearInterval(dataInterval)
        } else {
            counter += 1;
        }
    }, interval)
}

// Create the \`map\` object with the mapboxgl.Map constructor, referencing
// the container div
mapboxgl.accessToken = 'pk.eyJ1Ijoia3h1MTYiLCJhIjoiY2p5NXh1bzZqMGNrMzNkbzB1bjlsazluaCJ9.LWKf9jAXZmDmKgAWA-IS9g';

const styles = {
    light: "mapbox://styles/mapbox/light-v9",
    watercolor: {
        'version': 8,
        'sources': {
            'raster-tiles': {
                'type': 'raster',
                'tiles': [
                    'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
                ],
                'tileSize': 256,
                'attribution': 'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
            }
        },
        'layers': [
            {
                'id': 'simple-tiles',
                'type': 'raster',
                'source': 'raster-tiles',
                'minzoom': 0,
                'maxzoom': 22
            }
        ]
    },
    cali: "mapbox://styles/kxu16/cke3scnox0hmq19nj5a0d10g2",
    standard: "mapbox://styles/kxu16/cke1v54jy0bae19pdh9dh961w"
};
const map = new mapboxgl.Map({
    container: "map",
    center: [
        -86.75605, 33.54398
    ],
    zoom: 10,
    scrollZoom: false,
    style: styles.standard
});

// Manually define roadtrip geoJSON
const roadtrip = {
    "type": "Feature",
    "properties": {
        "pickuptime": "10/3/13 1:21",
        "dropofftime": "10/3/13 2:05",
        "key": "1",
        "hasfare": false
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [-84.41399, 33.71927],
            [-84.55835, 33.773],
            [-84.843, 33.7207],
            [-85.48198, 33.64726],
            [-86.08693, 33.58727],
            [-86.56049, 33.56115],
            [-86.75605, 33.54398],
            [-86.82005, 33.52091],
            [-86.81724, 33.57459],
            [-87.02852, 33.66409],
            [-87.17233, 33.71729],
            [-87.27646, 33.80678],
            [-87.50744, 33.91363],
            [-87.68261, 33.96247],
            [-87.85847, 34.02753],
            [-88.0594, 34.15331],
            [-88.38016, 34.24563]
        ]
    }
};

map.on('style.load', () => {
    const dummyGeojson = {
        type: 'FeatureCollection',
        features: []
    }

    map.addSource('lineAlong', {
        type: 'geojson',
        data: dummyGeojson
    });

    map.addLayer({
        id: 'lineAlong',
        type: 'line',
        source: 'lineAlong',
        paint: {
            'line-width': 5,
            'line-color': 'steelblue',
            'line-opacity': 0.6,
        }
    })

    map.addSource('pointAlong', {
        type: 'geojson',
        data: dummyGeojson,
    });

    map.addLayer({
        id: 'pointAlong',
        type: 'circle',
        source: 'pointAlong',
        paint: {
            'circle-color': 'yellow',
            'circle-stroke-width': 0.5,
            'circle-stroke-color': '#444',
        }
    });

    map.addSource('startPoint', {
        type: 'geojson',
        data: dummyGeojson,
    });

    map.addLayer({
        id: 'startPoint',
        type: 'circle',
        source: 'startPoint',
        paint: {
            'circle-color': 'green',
            'circle-stroke-width': 0.5,
            'circle-stroke-color': '#444',
        }
    });

    map.addSource('endPoint', {
        type: 'geojson',
        data: dummyGeojson,
    });

    map.addLayer({
        id: 'endPoint',
        type: 'circle',
        source: 'endPoint',
        paint: {
            'circle-color': 'red',
            'circle-stroke-width': 0.5,
            'circle-stroke-color': '#444',
        }
    });

    animateTrip(roadtrip);
});
