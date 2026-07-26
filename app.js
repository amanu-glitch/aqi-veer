// 1. Initialize Leaflet Map centered on India
const map = L.map('map', {
    zoomControl: false // Moved to top-right for cleaner layout
}).setView([23.5937, 78.9629], 5);

L.control.zoom({ position: 'topright' }).addTo(map);

// Add clean, high-contrast OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors | AQI Veer Project'
}).addTo(map);

// Layer Groups for easy management and clearing
let sensorLayerGroup = L.layerGroup().addTo(map);
let routeLayerGroup = L.layerGroup().addTo(map);
let currentSelectedCorridor = null;
let activeVehicleType = 'car';

// 2. Render Indian AQI Monitoring Network Nodes
function renderAQISensors() {
    sensorLayerGroup.clearLayers();
    
    // Check if toggle switch is on
    const toggle = document.getElementById('toggle-sensors');
    if (toggle && !toggle.checked) return;

    if (typeof IndianAQISensors === 'undefined') {
        console.error("data.js is not loaded properly.");
        return;
    }

    IndianAQISensors.forEach(sensor => {
        // Create pulsing colored circle markers
        const circle = L.circleMarker([sensor.lat, sensor.lng], {
            radius: 8,
            fillColor: sensor.color,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });

        // Add detailed tooltip popup
        circle.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 160px;">
                <h4 style="margin:0 0 6px 0; color:#1e272e; font-size: 14px;">${sensor.city}</h4>
                <p style="margin:0; font-size:13px;">Live AQI: <strong style="color:${sensor.color};">${sensor.aqi} (${sensor.status})</strong></p>
                <small style="color:#7f8c8d; display:block; margin-top:4px;">Particulate Monitor: PM2.5 Active</small>
            </div>
        `);

        sensorLayerGroup.addLayer(circle);
    });
}

// Initial Sensor Render on page load
renderAQISensors();

// Event listener for toggle switch
const toggleBtn = document.getElementById('toggle-sensors');
if (toggleBtn) {
    toggleBtn.addEventListener('change', renderAQISensors);
}

// 3. Vehicle Type Selection Handlers
document.querySelectorAll('.vehicle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.vehicle-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activeVehicleType = e.currentTarget.getAttribute('data-type');
        
        // Recalculate metrics if a route is currently displayed
        if (currentSelectedCorridor) {
            updateSidebarStats(currentSelectedCorridor);
        }
    });
});

// 4. Route Calculation & Polylines Engine
document.getElementById('calculate-btn').addEventListener('click', () => {
    const selectedKey = document.getElementById('route-select').value;
    
    if (typeof RouteCorridors === 'undefined' || !RouteCorridors[selectedKey]) {
        alert("Route data not found! Please check data.js.");
        return;
    }

    currentSelectedCorridor = RouteCorridors[selectedKey];
    renderRouteComparison(currentSelectedCorridor);
    
    // Enable the live drive simulation button
    const simBtn = document.getElementById('simulate-btn');
    if (simBtn) simBtn.disabled = false;
});

function renderRouteComparison(corridor) {
    routeLayerGroup.clearLayers();
    
    // Smoothly animate map view to fit the corridor
    map.flyTo(corridor.center, corridor.zoom, { duration: 1.5 });

    // Custom Start & End Pins
    const startIcon = L.divIcon({ className: 'pin-start', html: '📍', iconSize: [28, 28] });
    const endIcon = L.divIcon({ className: 'pin-end', html: '🏁', iconSize: [28, 28] });

    L.marker(corridor.standard.coords[0], { icon: startIcon }).addTo(routeLayerGroup)
        .bindPopup(`<b>Origin</b>`);
    L.marker(corridor.standard.coords[corridor.standard.coords.length - 1], { icon: endIcon }).addTo(routeLayerGroup)
        .bindPopup(`<b>Destination</b>`);

    // ROUTE 1: Standard Highway (Red Dashed Line - High AQI Exposure)
    const badPolyline = L.polyline(corridor.standard.coords, {
        color: '#e74c3c',
        weight: 6,
        opacity: 0.75,
        dashArray: '12, 12'
    }).addTo(routeLayerGroup).bindPopup(`<b>❌ Standard Highway Route</b><br>Average AQI: ${corridor.standard.aqi} (Poor)<br>High congestion & industrial smog.`);

    // ROUTE 2: AQI Veer Green Corridor (Solid Green Line - Clean Air)
    const goodPolyline = L.polyline(corridor.eco.coords, {
        color: '#27ae60',
        weight: 8,
        opacity: 0.95
    }).addTo(routeLayerGroup).bindPopup(`<b>🌱 AQI Veer Green Corridor</b><br>Average AQI: ${corridor.eco.aqi} (Clean)<br>Optimized for lower particulate intake!`);

    // Fit map bounds to show both routes comfortably with padding
    const allCoords = corridor.standard.coords.concat(corridor.eco.coords);
    map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60] });

    // Update Sidebar UI Cards & Adjust for Vehicle Type
    updateSidebarStats(corridor);
}

function updateSidebarStats(corridor) {
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) resultsPanel.style.display = 'block';

    // Apply time modifiers based on vehicle type
    let timeNote = "";
    if (activeVehicleType === 'bike') timeNote = " (Fast in traffic)";
    if (activeVehicleType === 'truck') timeNote = " (Heavy speed limit)";
    if (activeVehicleType === 'ev') timeNote = " (Eco cruise speed)";

    // Update Bad Route Card
    document.getElementById('bad-aqi-badge').innerText = `AQI: ${corridor.standard.aqi}`;
    document.getElementById('bad-dist').innerText = corridor.standard.dist;
    document.getElementById('bad-time').innerText = corridor.standard.time + timeNote;
    document.getElementById('bad-pm').innerText = corridor.standard.pm25;

    // Update Good Route Card
    document.getElementById('good-aqi-badge').innerText = `AQI: ${corridor.eco.aqi}`;
    document.getElementById('good-dist').innerText = corridor.eco.dist;
    document.getElementById('good-time').innerText = corridor.eco.time + timeNote;
    document.getElementById('good-pm').innerText = corridor.eco.pm25;

    // Populate Turn-by-Turn Waypoints Log
    const listContainer = document.getElementById('waypoint-list');
    if (listContainer) {
        listContainer.innerHTML = ''; // Clear previous log

        corridor.eco.waypoints.forEach(wp => {
            listContainer.innerHTML += `
                <li class="waypoint-item clean">
                    <span>🌱 ${wp.name}</span>
                    <span class="badge green">AQI ${wp.aqi}</span>
                </li>
            `;
        });

        corridor.standard.waypoints.forEach(wp => {
            listContainer.innerHTML += `
                <li class="waypoint-item polluted">
                    <span>⚠️ Avoided: ${wp.name}</span>
                    <span class="badge red">AQI ${wp.aqi}</span>
                </li>
            `;
        });
    }
}
