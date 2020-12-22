// API key
const API_KEY = 'pk.eyJ1IjoidnlhbWF5a2luIiwiYSI6ImNqdzE4Z2Z6cTBqYTk0NW1td3pkdG8weHoifQ.3hQWt5XCCJhO0SJZoy-E1g';

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL and make the map and the markers 
d3.json(queryUrl, createMarkers, createMap);


function createMap(earthquakes, tectonicplates) {
  
  // Define streetmap and darkmap layers
  var satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/satellite-streets-v11',
    accessToken: API_KEY
    });

  var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/light-v10',
    accessToken: API_KEY
    });

    var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/dark-v10',
    accessToken: API_KEY
    });

  var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'mapbox/streets-v11',
    accessToken: API_KEY
    });

  // Define a baseMaps object to hold our base layers
   var baseMaps = {
    "Grayscale": lightmap,
    "Darkscale": darkmap, 
    "Satellite": satellitemap,
    "Streets": streetmap
  };
  
  // Define a layer group for tectonic plates 
  var tectonicplates = new L.LayerGroup();

  // Make an AJAX call to get Tectonic Plate geoJSON data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
  function(platedata) {
    // Adding our geoJSON data, along with style information, to the tectonicplates
    // layer.
    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    })
    .addTo(tectonicplates);
  });
  

   // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicplates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [
      30.09, -15.71
    ],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

      // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function(div) {

    var div = L.DomUtil.create('div', 'info legend'),
    categories = [2, 4, 5],
    colors = ["#ffeda0", "#feb24c", "#f03b20"];

    div.innerHTML = "<h3><u>Magnitude</u></h3>"; 
    
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            categories[i] + (categories[i + 1] ? ' &ndash; ' + categories[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(map);

}

// start of the make markers functions 

function createMarkers(response) {
  
  var earthquakes = response.features

  var quakeMarkers = []

  for (var i = 0; i < earthquakes.length; i++) {
    var earthquake = earthquakes[i]

    var color = "";
    if (earthquake.properties.mag >= 5) {
    color = "#f03b20";
    }
    else if (earthquake.properties.mag >= 4 && earthquake.properties.mag < 5) {
      color = "#feb24c";
    }
    else {
      color = "#ffeda0";
    }

    var quakeMarker = L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
        color: "black", 
        weight: 2, 
        fillColor: color, 
        fillOpacity: 0.8,
        radius: earthquake.properties.mag * 40000,
    }).bindPopup("<h3>" + earthquake.properties.place + "</h3><hr><h3>Magnitude: " + earthquake.properties.mag + "  <hr>Date: " + new Date(earthquake.properties.time)+ "</h3>");

    quakeMarkers.push(quakeMarker); 
  }

// Sending our earthquakes layer to the createMap function
createMap(L.layerGroup(quakeMarkers));

}


