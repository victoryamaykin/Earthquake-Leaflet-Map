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
    "Satellite": satellitemap,
    "Streets": streetmap
  };
  
var tectonicplates = new L.LayerGroup();

// Here we make an AJAX call to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
function(platedata) {
  // Adding our geoJSON data, along with style information, to the tectonicplates
  // layer.
  L.geoJson(platedata, {
    color: "orange",
    weight: 2
  })
  .addTo(tectonicplates);

  // Then add the tectonicplates layer to the map.
  tectonicplates.addTo(map);
});

   // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Tectonic Plates": tectonicplates,  
    "Earthquakes": earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [
      30.09, -15.71
    ],
    zoom: 3,
    layers: [lightmap, tectonicplates, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(map);

var legend = L.control({position: 'bottomright'});

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
d3.json(queryUrl, createMarkers, createMap);



    