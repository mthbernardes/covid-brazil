var map = L.map('map', { renderer: L.canvas(), center: [-9.68489 , -36.3078], zoom: 4})
var brasil_io_url = "https://brasil.io/api/dataset/covid19/caso/data/?format=json";
var global_counties;

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 4,    
    crossOrigin: true
}).addTo(map);

function createCircle(lat,lng,confirmed,city){
    if (confirmed != 0){
        circle = new L.circle([lat, lng], 2000, {
            color: 'red',
            opacity: .1,
            radius: confirmed,
        }).bindPopup(confirmed + " Casos confirmados em "+city)
        circle.addTo(map);
    }
}

function parse_data(data) {
    let {city,confirmed,city_ibge_code,is_last} = data;
    let city_data = global_counties.filter(function(city){
        return city["codigo_ibge"] == city_ibge_code; 
    })
    if (city_data && city_data.length && is_last){
        let {longitude,latitude} = city_data[0];
        createCircle(latitude,longitude,confirmed,city);
    }
}

function getCases(url){
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let {next,results} = data;
            if (next){
                getCases(next);
            }
            results.map(parse_data)
        });
}

map.addControl( new L.Control.Search({
    url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}&countrycodes=br',
    jsonpParam: 'json_callback',
    propertyName: 'display_name',
    propertyLoc: ['lat','lon'],
    zoom: 12,
    autoCollapse: true,
    hideMarkerOnCollapse: true,
    autoType: false,
    minLength: 2
}) );

fetch(window.location.href+"/data/counties.json")
    .then(response => response.json())
    .then(counties => {
        global_counties = counties;
        getCases(brasil_io_url);
    })
