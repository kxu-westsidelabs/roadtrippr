# Roadtrippr

![Animated Roadtrip](roadtrippr.gif)

See the [live version](https://kxu-westsidelabs.github.io/roadtrippr/)

## Project Overview

There are 3 steps when converting a list of addresses into a mappable route. 

1. Geocode the addresses into coordinates (latitude, longitude)
2. Calculate the directions for a route containing all the coordinates
3. Parse and convert the directions output into a format usable by your client-side mapping service

Once the route data is cleaned up, the front end is able to use that data to generate the map, route, waypoints, and handle the resulting animations. 


## Working with Polylines 

A polyline is used to represent routes, paths, and other connections between locations. 

Polylines are formed from coordinate pairs (lat, long). Each coordinate encoding also stores information about whether or not the coordinate is displayed at a given zoom level. 

Google Maps returns directions data with two levels of precision:

- High-level via `overview_polyline` composed of fewer coordinates which is faster to render 
- Lower-level route data for each leg. Directions between two points will only have one leg - adding waypoints along the route will also increase the number of corresponding legs. 

Directions data is returned as an encoded polyline, for example:  `_p~iF~ps|U_ulLnnqC??`.

The [encoding algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm) takes in a series of coordinates and outputs an ASCII representation of the polyline based on differences between latitude and longitude between coordinates.

As part of the mapping process, we decode these polylines back into coordinate pairs. 

## Front End

The mapping and animations were inspired by [Chris Whong's NYC Taxi visualization](https://chriswhong.github.io/nyctaxi/). 

The front end is built with Mapbox GL, with separate layers for: 

* Trip route
* Starting / endping points
* Intermediate waypoints

The map supports the following interactions:

* Dynamically updating the map style
* Image pop-ups at each waypoint location
* Animations along the route


## Getting Started

The map is currently run statically and can be loaded from file. 

The route data is the raw Google Maps directions response, which is stored in `script.js`. 

To generate a new route, update the addresses in `generate.js`, re-run via `node generate.js`, and update the response in `script.js`. 

Image paths would also need to be updated in `script.js`. 

## Next Steps


### Add backend support for arbitrary addresses

This route is specific to a trip that I took in 2020, but the next step is to generalize the backend so that it accepts an arbitrary list of addresses. 

This would also include adding a lightweight server component that would: 

* process user-generated addresses from the front-end
* query Google Maps directions service
* parse the response and hand back to front-end for mapping


### Update front-end to allow more flexible user controls




## Data Structures

### Backend

Google Maps directions response - extended sample in [geocoded_waypoints.json](geocoded_waypoints.json).

```json
{
	"routes": [
		{
			"legs": [
        {
          "distance": {
            "text": "558 mi",
            "value": 897938
          },
          "end_address": "Williams Junction, AR 72126, USA",
          "end_location": {
            "lat": 34.8814,
            "lng": -92.7735577
          },
          "start_address": "Atlanta, GA, USA",
          "start_location": {
            "lat": 33.7484483,
            "lng": -84.387653
          },
          "steps": [
            {
              "polyline": {
                "points": "yn~lEx}`bOQCi@Oy@[aA["
              },
              "start_location": {
                "lat": 33.7484483,
                "lng": -84.387653
              },
              "travel_mode": "DRIVING"
            },
			...
}

```

### Frontend

Waypoints are stored as GeoJSON with coordinates and metadata for each point.

```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    -84.387653,
                    33.7484483
                ]
            },
            "properties": {
                "address": "Atlanta, GA, USA",
                "distance_to_next": "558 mi",
                "image_url": "./images/atlanta.jpg",
                "title": "Atlanta, GA",
                "orientation": "portrait"
            }
        },
      ...
   ]
}
```
