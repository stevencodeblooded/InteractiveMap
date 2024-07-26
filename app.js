// Initialize the map
var map = L.map('map').setView([-1.2637518, 36.8507504], 13); // Center on the coordinates in your data

// Add light mode tile layer
var lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Add dark mode tile layer
var darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Set the initial layer to light mode
lightLayer.addTo(map);

// Create a marker cluster group
var markers = L.markerClusterGroup();

// Function to create popup content
function createPopupContent(properties, coordinates) {
    let content = '<strong>Amenity:</strong> ' + (properties.amenity || 'N/A') + '<br>';
    if (properties.name) content += '<strong>Name:</strong> ' + properties.name + '<br>';
    if (properties.access) content += '<strong>Access:</strong> ' + properties.access + '<br>';
    if (properties.operational_status) content += '<strong>Operational Status:</strong> ' + properties.operational_status + '<br>';
    if (properties.opening_hours) content += '<strong>Opening Hours:</strong> ' + properties.opening_hours + '<br>';
    if (properties.operator) content += '<strong>Operator:</strong> ' + properties.operator + '<br>';
    if (properties.fee) content += '<strong>Fee:</strong> ' + properties.fee + '<br>';
    if (properties['watsan:cost']) content += '<strong>Cost:</strong> ' + properties['watsan:cost'] + '<br>';
    if (properties['watsan:description']) content += '<strong>Description:</strong> ' + properties['watsan:description'] + '<br>';
    if (properties['watsan:water_private']) content += '<strong>Water Private:</strong> ' + properties['watsan:water_private'] + '<br>';
    if (properties['watsan:water_public']) content += '<strong>Water Public:</strong> ' + properties['watsan:water_public'] + '<br>';
    if (properties.notes) content += '<strong>Notes:</strong> ' + properties.notes + '<br>';
    content += '<strong>Coordinates:</strong> ' + coordinates[1] + ', ' + coordinates[0] + '<br>';
    return content;
}

// Function to fetch and add GeoJSON data
function loadGeoJSON() {
    fetch('export.geojson') // Path to your GeoJSON file
        .then(response => response.json())
        .then(data => {
            console.log('GeoJSON data loaded:', data); // Log the loaded GeoJSON data

            // Add GeoJSON data to the cluster group
            var geojsonLayer = L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng, {
                        title: feature.properties.name // Display feature name on hover
                    });
                },
                onEachFeature: function (feature, layer) {
                    console.log('Processing feature:', feature); // Log each feature being processed
                    if (feature.properties) {
                        layer.bindPopup(createPopupContent(feature.properties, feature.geometry.coordinates));
                    }
                }
            });

            // Add the GeoJSON layer to the marker cluster group
            markers.addLayer(geojsonLayer);

            // Add the cluster group to the map
            map.addLayer(markers);

            // Initialize search control
            var searchControl = new L.Control.Search({
                layer: markers,
                propertyName: 'name',
                marker: false,
                moveToLocation: function(latlng, title, map) {
                    map.setView(latlng, 17); // Zoom level for searched location
                }
            });

            searchControl.on('search:locationfound', function(e) {
                e.layer.openPopup();
            });

            map.addControl(searchControl);
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
}

// Load GeoJSON data
loadGeoJSON();

// Add layer control to switch between light and dark modes
var baseLayers = {
    "Light Mode": lightLayer,
    "Dark Mode": darkLayer
};

L.control.layers(baseLayers).addTo(map);

// Add user location marker
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

// Ensure map is responsive
window.addEventListener('resize', function() {
    map.invalidateSize();
});
