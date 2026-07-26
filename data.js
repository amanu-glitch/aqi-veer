// Database of Live Indian Air Quality Sensors (Simulated Monitoring Grid)
const IndianAQISensors = [
    { city: "New Delhi (Anand Vihar)", lat: 28.6500, lng: 77.3100, aqi: 365, status: "Severe", color: "#ff5252" },
    { city: "New Delhi (Connaught Place)", lat: 28.6315, lng: 77.2167, aqi: 290, status: "Poor", color: "#ffa801" },
    { city: "Noida (Sector 62)", lat: 28.6208, lng: 77.3639, aqi: 310, status: "Severe", color: "#ff5252" },
    { city: "Gurugram (Cyber City)", lat: 28.4950, lng: 77.0895, aqi: 275, status: "Poor", color: "#ffa801" },
    { city: "Kanpur (Anwarganj)", lat: 26.4520, lng: 80.3300, aqi: 285, status: "Poor", color: "#ffa801" },
    { city: "Kanpur (IIT Campus)", lat: 26.5123, lng: 80.2329, aqi: 140, status: "Moderate", color: "#ffd32a" },
    { city: "Lucknow (Hazratganj)", lat: 26.8467, lng: 80.9462, aqi: 245, status: "Poor", color: "#ffa801" },
    { city: "Agra (Sanjay Place)", lat: 27.1900, lng: 78.0050, aqi: 260, status: "Poor", color: "#ffa801" },
    { city: "Mathura Green Belt", lat: 27.4924, lng: 77.6737, aqi: 95, status: "Good", color: "#2ecc71" },
    { city: "Etawah Rural Corridor", lat: 26.7855, lng: 79.0150, aqi: 85, status: "Good", color: "#2ecc71" },
    { city: "Jaipur (Johari Bazaar)", lat: 26.9124, lng: 75.7873, aqi: 185, status: "Moderate", color: "#ffd32a" },
    { city: "Alwar Sanctuary Bypass", lat: 27.5530, lng: 76.6346, aqi: 70, status: "Good", color: "#2ecc71" },
    { city: "Mumbai (Bandra)", lat: 19.0596, lng: 72.8295, aqi: 145, status: "Moderate", color: "#ffd32a" },
    { city: "Lonavala Ghat Corridor", lat: 18.7557, lng: 73.4091, aqi: 45, status: "Good", color: "#2ecc71" },
    { city: "Pune (Shivajinagar)", lat: 18.5314, lng: 73.8446, aqi: 160, status: "Moderate", color: "#ffd32a" },
    { city: "Bengaluru (Silk Board)", lat: 12.9172, lng: 77.6228, aqi: 110, status: "Moderate", color: "#ffd32a" },
    { city: "Mandya Green Route", lat: 12.5237, lng: 76.8958, aqi: 40, status: "Good", color: "#2ecc71" },
    { city: "Mysuru (Palace Area)", lat: 12.3051, lng: 76.6551, aqi: 55, status: "Good", color: "#2ecc71" }
];

// Pre-Calculated Route Corridors (Comparing Standard Highway vs AQI Veer Eco Corridor)
const RouteCorridors = {
    "kanpur_delhi": {
        name: "Kanpur to New Delhi",
        center: [27.5, 78.8],
        zoom: 7,
        standard: {
            aqi: 285, dist: "473 km", time: "5h 40m", pm25: "48 µg/m³ (High Risk)",
            coords: [
                [26.4499, 80.3319], // Kanpur City
                [27.1767, 78.0081], // Agra Heavy Traffic Belt
                [27.8974, 78.0880], // Aligarh Industrial Zone
                [28.5355, 77.3910], // Noida Congestion
                [28.6139, 77.2090]  // New Delhi
            ],
            waypoints: [
                { name: "Kanpur Industrial Exit", aqi: 280, type: "polluted" },
                { name: "Agra Highway Toll (Smog Zone)", aqi: 310, type: "polluted" },
                { name: "Aligarh Heavy Transport Corridor", aqi: 295, type: "polluted" },
                { name: "Noida Sector Expressway", aqi: 330, type: "polluted" }
            ]
        },
        eco: {
            aqi: 105, dist: "488 km", time: "6h 10m", pm25: "16 µg/m³ (Clean)",
            coords: [
                [26.4499, 80.3319], // Kanpur City
                [26.7924, 79.0225], // Etawah Rural Expressway Bypass
                [27.4924, 77.6737], // Mathura Peripheral Green Belt
                [28.2050, 76.8366], // Rewari Clean Corridor
                [28.6139, 77.2090]  // New Delhi
            ],
            waypoints: [
                { name: "Etawah Agricultural Bypass", aqi: 85, type: "clean" },
                { name: "Chambal Valley Clean Air Zone", aqi: 70, type: "clean" },
                { name: "Mathura Outer Green Expressway", aqi: 95, type: "clean" },
                { name: "Rewari Wind-Corridor Approach", aqi: 110, type: "clean" }
            ]
        }
    },
    "mumbai_pune": {
        name: "Mumbai to Pune",
        center: [18.85, 73.3],
        zoom: 9,
        standard: {
            aqi: 155, dist: "152 km", time: "3h 10m", pm25: "32 µg/m³ (Moderate)",
            coords: [ [19.0760, 72.8777], [18.9894, 73.1175], [18.7557, 73.4091], [18.5204, 73.8567] ],
            waypoints: [ { name: "Navi Mumbai Industrial Belt", aqi: 170, type: "polluted" }, { name: "Expressway Tunnel Exhaust Zone", aqi: 185, type: "polluted" } ]
        },
        eco: {
            aqi: 65, dist: "164 km", time: "3h 25m", pm25: "12 µg/m³ (Very Clean)",
            coords: [ [19.0760, 72.8777], [18.8250, 73.2350], [18.6800, 73.4500], [18.5204, 73.8567] ],
            waypoints: [ { name: "Tamhini Ghat Eco-Corridor", aqi: 50, type: "clean" }, { name: "Mulshi Lake Valley Route", aqi: 45, type: "clean" } ]
        }
    },
    "bengaluru_mysuru": {
        name: "Bengaluru to Mysuru",
        center: [12.65, 77.1],
        zoom: 9,
        standard: {
            aqi: 115, dist: "145 km", time: "2h 30m", pm25: "24 µg/m³ (Moderate)",
            coords: [ [12.9716, 77.5946], [12.7209, 77.2839], [12.5237, 76.8958], [12.2958, 76.6394] ],
            waypoints: [ { name: "Bidadi Industrial Highway", aqi: 135, type: "polluted" }, { name: "Ramanagara Traffic Belt", aqi: 120, type: "polluted" } ]
        },
        eco: {
            aqi: 45, dist: "158 km", time: "2h 45m", pm25: "9 µg/m³ (Pristine)",
            coords: [ [12.9716, 77.5946], [12.6500, 77.1000], [12.4500, 76.8000], [12.2958, 76.6394] ],
            waypoints: [ { name: "Kanakapura Rural Plantation Route", aqi: 40, type: "clean" }, { name: "Shivanasamudra Green Approach", aqi: 45, type: "clean" } ]
        }
    },
    "delhi_jaipur": {
        name: "New Delhi to Jaipur",
        center: [27.8, 76.5],
        zoom: 8,
        standard: {
            aqi: 265, dist: "280 km", time: "4h 45m", pm25: "42 µg/m³ (Poor)",
            coords: [ [28.6139, 77.2090], [28.3588, 76.9580], [27.9974, 76.3851], [26.9124, 75.7873] ],
            waypoints: [ { name: "Manesar Industrial Sector", aqi: 290, type: "polluted" }, { name: "Dharuhera Heavy Truck Highway", aqi: 310, type: "polluted" } ]
        },
        eco: {
            aqi: 110, dist: "305 km", time: "5h 10m", pm25: "18 µg/m³ (Clean)",
            coords: [ [28.6139, 77.2090], [28.1500, 77.0000], [27.5530, 76.6346], [26.9124, 75.7873] ],
            waypoints: [ { name: "Sohna Rural Elevated Corridor", aqi: 120, type: "clean" }, { name: "Sariska Tiger Reserve Border Route", aqi: 70, type: "clean" } ]
        }
    }
};
