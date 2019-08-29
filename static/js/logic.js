// API key
const API_KEY = "pk.eyJ1IjoidnlhbWF5a2luIiwiYSI6ImNqdzE4amRzbzBqZDg0M29kNDRkejdkNWwifQ.wyQb7NvEKlovRjXRKENS5Q";

function createMap(earthquakes) {
  
  // Define streetmap and darkmap layers
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    noWrap: true, 
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    noWrap: true, 
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    noWrap: true, 
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
   var baseMaps = {
    "Grayscale": lightmap,
    "Satellite": satellitemap,
    "Streets": streetmap
  };
    
  // Store our API endpoint inside queryUrl
  var link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  // Perform a GET request to the query URL
  d3.json(link, function(data) {
    L.geoJson(data, {
      style: {
        color: "orange",
        weight: 3, 
        fillColor: "white",
        fillOpacity: 0
      }
      }
    ); 

  });

   // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [
      30.09, -55.71
    ],
    zoom: 2,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    categories = [0, 1, 2, 3, 4, 5],
    colors = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < categories.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(map);




}

function createMarkers(response) {
  
  var earthquakes = response.features

  console.log(earthquakes)
  var quakeMarkers = []

  for (var i = 0; i < earthquakes.length; i++) {
    var earthquake = earthquakes[i]

    var color = "";
    if (earthquake.properties.mag > 5) {
    color = "#bd0026";
    }
    else if (earthquake.properties.mag >= 4 && earthquake.properties.mag < 5) {
      color = "#f03b20";
    }
    else if (earthquake.properties.mag >= 3 && earthquake.properties.mag < 4) {
      color = "#fd8d3c";
    }
    else if (earthquake.properties.mag >= 2 && earthquake.properties.mag < 3) {
      color = "#feb24c";
    }
    else if (2 > earthquake.properties.mag >= 1 && earthquake.properties.mag < 2) {
      color = "#fed976";
    }
    else {
      color = "#ffffb2";
    }

    var quakeMarker = L.circle([earthquake.geometry.coordinates[1],earthquake.geometry.coordinates[0]], {
        color: "black", 
        weight: 2, 
        fillColor: color, 
        fillOpacity: 0.8,
        radius: earthquake.properties.mag * 10000,
    }).bindPopup("<h2>" + earthquake.properties.place + "</h2><hr><h2>Magnitude: " + earthquake.properties.mag + "  <hr>Date: " + new Date(earthquake.properties.time)+ "</h2>");

    quakeMarkers.push(quakeMarker); 
  }

// Sending our earthquakes layer to the createMap function
createMap(L.layerGroup(quakeMarkers));

}

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, createMarkers);


    