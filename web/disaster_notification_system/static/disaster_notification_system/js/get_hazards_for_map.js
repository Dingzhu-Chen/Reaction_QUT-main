// Custom icons for different incident types
let fireIcon = L.icon({
    // iconUrl:'https://svgshare.com/i/xWt.svg',
    iconUrl: 'https://i.imgur.com/S0b6BcO.png',
    iconSize: [30, 30],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -16]   
});

let waterIcon = L.icon({
    iconUrl:'https://i.imgur.com/OC3GeFx.png',
    iconSize: [30, 30],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -25]   
});

let disasterIcon = L.icon({
    iconUrl:'https://i.imgur.com/w12naKC.png',
    iconSize: [30, 30],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -25]   
});

let fireandRWIcon = L.icon({
    iconUrl: 'https://i.imgur.com/AvstUej.png',
    iconSize: [35, 35],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -16]
});

let waterandRWIcon = L.icon({
    iconUrl: 'https://i.imgur.com/X7Vggld.png',
    iconSize: [30, 30],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -25]
});

let disasterandRWIcon = L.icon({
    iconUrl: 'https://i.imgur.com/qWJ2DRr.png',
    iconSize: [30, 30],
    iconAnchor: [20, 20],   // Middle 
    popupAnchor: [0, -25]
});

function getHazardsForMap(data, disastersApplicationsFeature, roadHazardApplicationsFeature){
    for(let i = 0; i < data.features.length; i++){
        let feature = data.features[i]
        if(feature.api_type === "escad" || feature.api_type === "water") escadWaterHazards(feature, disastersApplicationsFeature)
        else roadHazards(feature, roadHazardApplicationsFeature)
    }
}

function escadWaterHazards(feature, disastersApplicationsFeature){
    let latitude = feature.geometry.coordinates[1];
    let longitude = feature.geometry.coordinates[0];

    let marker

    if(feature.geometry.type == "Point"){
        // Check feature type before adding icon
        if(feature.api_type == "escad"){
            if((feature.properties['GroupedType']).includes("FIRE")){
                marker = L.marker([latitude, longitude], {icon: fireIcon, feature: feature});
            } else{
                marker = L.marker([latitude, longitude], {icon: disasterIcon, feature: feature});
            }
        } else if(feature.api_type == "water"){
            marker = L.marker([latitude, longitude], {icon: waterIcon, feature: feature});
        }
    }

    // Adding a popup to the marker with property information
    let popupContent = `
        <table style="font-family: Arial, sans-serif;">
        <tr><th>Name:</th><td>${feature.name}</td></tr>
        <tr><th>Status:</th><td>${feature.properties.status}</td></tr>
        <tr><th>Type:</th><td>${feature.properties.GroupedType}</td></tr>
        <tr><th>Vehicles Assigned:</th><td>${feature.properties.VehiclesAssigned + feature.properties.VehiclesOnRoute + feature.properties.VehiclesOnScene}</td></tr>
        <tr><th>Response Date:</th><td>${new Date(feature.properties.Response_Date).toLocaleString()}</td></tr>
        <tr><th>Last Updated:</th><td>${new Date(feature.properties.LastUpdate).toLocaleString()}</td></tr>
    </table>`;
    marker.bindPopup(popupContent);
    marker.feature
    marker.addTo(disastersApplicationsFeature); // Adding the marker directly to the map   
}

function roadHazards(feature, roadHazardApplicationsFeature){
    let popupContent = `
    <table style="font-family: Arial, sans-serif;">
    <tr><th>Type:</th><td>${feature.properties.event_type} - ${feature.properties.event_subtype}</td></tr>
    <tr><th>Cause:</th><td>${feature.properties.dueTo == null ? "No Cause" : feature.properties.dueTo}</td></tr>
    <tr><th>Impact:</th><td>${feature.properties.impact.direction}, ${feature.properties.impact.impact_subtype}</td></tr>
    <tr><th>Start Date:</th><td>${feature.properties.duration.start}</td></tr>
    <tr><th>End Date:</th><td>${feature.properties.duration.end == null ? "No End Date" : feature.properties.duration.end}</td></tr>
    <tr><th>Road:</th><td>${feature.properties.road_summary.road_name}, ${feature.properties.road_summary.locality}, ${feature.properties.road_summary.postcode}</td></tr>
</table>`;
    if(feature.geometry.type == "Point"){
        let marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {feature: feature, icon: getRoadIcon(feature)}).addTo(roadHazardApplicationsFeature);
            marker.bindPopup(popupContent);
    }
    else if(feature.geometry.type == "MultiPoint"){
        let latlng = []
        for (let j = 0; j < feature.geometry.coordinates.length; j++) {
            latlng.push([feature.geometry.coordinates[j][1], feature.geometry.coordinates[j][0]]);
            if(j == Math.round(feature.geometry.coordinates[0].length / 2)){
                let iconMarker = L.marker([feature.geometry.coordinates[j][1], feature.geometry.coordinates[j][0]], {feature: feature, icon: getRoadIcon(feature)}).addTo(roadHazardApplicationsFeature);
                iconMarker.bindPopup(popupContent);
            }
        }
        let marker = L.polyline(latlng, {color: 'red', feature: feature, icon: waterIcon}).addTo(roadHazardApplicationsFeature)
            marker.bindPopup(popupContent);
    }
    else if(feature.geometry.type == "MultiLineString"){
        let latlng = []
        let latlngMarker = []
        for (let j = 0; j < feature.geometry.coordinates[0].length; j++) {
            latlng.push([feature.geometry.coordinates[0][j][1], feature.geometry.coordinates[0][j][0]]);
            if(j == Math.round(feature.geometry.coordinates[0].length / 2)){
                let iconMarker = L.marker([feature.geometry.coordinates[0][j][1], feature.geometry.coordinates[0][j][0]], {feature: feature, icon: getRoadIcon(feature)}).addTo(roadHazardApplicationsFeature);
                iconMarker.bindPopup(popupContent);
            }
        }
        let marker = L.polyline(latlng, {color: 'red', feature: feature, icon: getRoadIcon(feature)}).addTo(roadHazardApplicationsFeature)
            marker.bindPopup(popupContent);
    }
}

function getRoadIcon(feature){
    let eventDueTo = feature.properties.event_subtype;
    if(eventDueTo.toLowerCase().includes("fire")){
        return fireandRWIcon;
    } else if(eventDueTo.toLowerCase().includes("flood")){
        return waterandRWIcon;
    } else{
        return disasterandRWIcon;
    }

}

export default getHazardsForMap