var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var orangeColorarray=["#ffcca5","#ffb37e","#ff9143","#ff6f08","#cc5500","#a54500"];
// Perform a GET request to the query URL
d3.json(earthquakeURL, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the magnitude, place and time of the earthquake
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .6,
          color: "white",
          stroke: true,
          weight: .8
        })
    }
  });

  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

    //Tectonic plates layer
    var tectonicPlates = new L.LayerGroup();
  
    // Define streetmap and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    // Define a baseMaps object to hold our base layers
    // Pass in our baseMaps 
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };

    
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      // "Earthquakes": earthquakes,
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };

    // Create our map: outdoors, earthquakes, tectonicPlates layers to load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71],
      zoom: 3.25,
      layers: [outdoors, earthquakes, tectonicPlates]
   
    }); 

    // Add Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
      // Adding our geoJSON data, along with style information, to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "yellow",
        weight: 2
        
      })
      .addTo(tectonicPlates);
  });

  
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

 
   // Set up the legend
   var legend = L.control({ position: "bottomleft" });
   legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              labels = [];
    div.innerHTML = ''
  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < orangeColorarray.length; i++) {
        div.innerHTML +=
            '<i style="background-color:' + getColor(i + 1) + '"> ' +
            i + (i + 1 ? '&ndash;' + (i + 1) + '</i>'+'<br>' : '+');
    }
    return div;
  };

 
    legend.addTo(myMap);
}
 
  
  function getColor(diameter){
    return diameter > 5 ?   orangeColorarray[5]:
           diameter > 4 ?   orangeColorarray[4]:
           diameter > 3 ?   orangeColorarray[3]:
           diameter > 2 ?   orangeColorarray[2]:
           diameter > 1 ?   orangeColorarray[1]:
                            orangeColorarray[0];
  }
  //Change the maginutde of the earthquake by a factor of 25,000 for the radius of the circle. 
  function getRadius(value){
    return value*25000
  }
