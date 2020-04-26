var map = L.map('map',{renderer: L.canvas()}).setView([-9.68489 , -36.3078], 4);
var brasil_io_url = "https://brasil.io/api/dataset/covid19/caso/data/?format=json";
var global_counties;

L.tileLayer('https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=HaCoHE37CXvW8kmOGBV2',{
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 4,    
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstr    eetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    crossOrigin: true
}).addTo(map);

function createCircle(lat,lng,confirmed,city){
    console.log(city,confirmed);
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

fetch(window.location.href+"/counties.json")
    .then(response => response.json())
    .then(counties => {
        global_counties = counties;
        getCases(brasil_io_url);
    })

