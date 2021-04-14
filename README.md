
## Instructions

* generate.js - takes in an array of locations and hits the Google Maps Directions API.
Output is JSON blob - example in [geocoded_waypoints.json](geocoded_waypoints.json).

* script.js - parses the reponse


## Data Structures

### Google Maps Directions response

view [sample output](geocoded_waypoints_example.json)
* `geocoded_waypoints` - array of the place_ids that were specified as well as tags ("locality", "premise", "establishment", "natural_feature", "point_of_interest")
* `routes` - array with one object element
    * `legs` - array with data on each leg (waypoint to waypoint)
        * `steps` - array that contains the individual direction steps
            * `polyline` - specific polylines
    * `overview_polyline` - rough polyline

