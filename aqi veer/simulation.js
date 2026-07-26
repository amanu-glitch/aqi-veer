// 1. Dynamic Floating & Spinning Leaves Generator
function initLeafStorm() {
    const container = document.getElementById('leaves-container');
    if (!container) return;

    const leafCount = 18; // Number of simultaneous floating leaves

    // SVG Green Leaf Data URI
    const leafSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2327ae60"><path d="M17,8C8,10 5,16 5,22C11,22 17,19 19,10C20,8 19,6 17,8Z"/></svg>`;

    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.classList.add('leaf-particle');
        
        // Randomize dimensions and physics for a natural fall
        const size = Math.random() * 18 + 14; // 14px to 32px
        const leftPos = Math.random() * 100; // Screen width percentage
        const fallDuration = Math.random() * 10 + 8; // 8s to 18s
        const startDelay = Math.random() * 7; // 0s to 7s

        leaf.style.width = `${size}px`;
        leaf.style.height = `${size}px`;
        leaf.style.left = `${leftPos}%`;
        leaf.style.backgroundImage = `url('${leafSVG}')`;
        leaf.style.animationDuration = `${fallDuration}s`;
        leaf.style.animationDelay = `${startDelay}s`;

        container.appendChild(leaf);
    }
}

// Initialize leaves automatically when DOM is fully loaded
window.addEventListener('DOMContentLoaded', initLeafStorm);

// 2. Live Driving Simulation Engine
let activeSimMarker = null;
let simInterval = null;

const simulateBtn = document.getElementById('simulate-btn');
if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
        if (!currentSelectedCorridor) {
            alert("Please calculate and select a route corridor first!");
            return;
        }

        // Stop and clean up existing simulation if already running
        if (simInterval) clearInterval(simInterval);
        if (activeSimMarker) map.removeLayer(activeSimMarker);

        const ecoCoords = currentSelectedCorridor.eco.coords;
        let currentStep = 0;

        // Determine vehicle icon based on active selection
        let iconEmoji = '🚗';
        if (activeVehicleType === 'ev') iconEmoji = '⚡';
        if (activeVehicleType === 'bike') iconEmoji = '🏍️';
        if (activeVehicleType === 'truck') iconEmoji = '🚛';

        // Create Custom Moving Vehicle Marker
        const carIcon = L.divIcon({
            className: 'sim-car-pin',
            html: `<div style="font-size: 28px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4)); transition: all 0.3s;">${iconEmoji}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        activeSimMarker = L.marker(ecoCoords[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);

        // Show Simulation Telemetry Overlay in Top Right
        const overlay = document.getElementById('sim-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.innerHTML = `
                <div class="sim-status">
                    <span class="sim-indicator"></span>
                    <strong>Driving on AQI Veer Route...</strong>
                </div>
                <div class="sim-details">
                    Current Zone AQI: <span id="sim-current-aqi" class="badge green">${currentSelectedCorridor.eco.aqi} (Clean)</span>
                </div>
            `;
        }

        // Zoom in slightly on starting point for a dynamic drive feel
        map.setView(ecoCoords[0], 10, { animate: true, duration: 1 });

        // Animate movement along polyline vertices
        simInterval = setInterval(() => {
            currentStep++;

            if (currentStep >= ecoCoords.length) {
                // Reached Destination!
                clearInterval(simInterval);
                if (overlay) {
                    overlay.innerHTML = `
                        <div class="sim-status" style="color: #2ecc71;">
                            <strong>🎉 Arrived at Destination Safely!</strong>
                        </div>
                        <div class="sim-details">Total Particulate Avoided: <b>~62%</b></div>
                    `;
                    setTimeout(() => { overlay.style.display = 'none'; }, 6000);
                }
                return;
            }

            // Move Marker and smoothly pan the map to follow the vehicle
            const nextCoord = ecoCoords[currentStep];
            activeSimMarker.setLatLng(nextCoord);
            map.panTo(nextCoord, { animate: true, duration: 1.5 });

            // Simulate dynamic, realistic AQI fluctuations along the route
            const baseAQI = currentSelectedCorridor.eco.aqi;
            const simulatedLiveAQI = Math.floor(baseAQI + (Math.random() * 16 - 8));
            
            const aqiBadge = document.getElementById('sim-current-aqi');
            if (aqiBadge) {
                aqiBadge.innerText = `${simulatedLiveAQI} (Active Green Belt)`;
            }

        }, 2200); // Advances to next waypoint every 2.2 seconds
    });
}