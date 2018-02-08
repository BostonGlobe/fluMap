'use strict';
(function() {
    // global variables
    var p1 = L.latLng(57.165951, -136.271319),
        p2 = L.latLng(17.924549, -65.533102),
        bounds = L.latLngBounds(p1, p2);
    var wWidth = window.innerWidth;
    var legendPosition= {position: 'topright'};

    // called once on page load
    var init = function() {

    };

    // called automatically on article page resize
    window.onResize = function(width) {


        map.setMaxBounds(bounds);
    };

    // called when the graphic enters the viewport
    window.enterView = function() {

    };


    // graphic code

    var map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false,
        dragging: false,
        maxBounds: bounds,
    }).setView([37.8, -96], 4);

    if(wWidth<= 500){
        map.setView([37.8, -96], 3);
    }

    var streetMap = L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc6jt6kk3thh2rpbd5pa6a0r/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
        id: 'mapbox.street',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    var week = 1, season =0, smax =9;
    var datamap=d3.map();

    d3.csv('./assets/FluViewPhase8_Season57-56-55-54-53-52-51-50-49-48_Data.csv', function (err, data) {
        var processedData = data.map(function (t) {
            return {
                activity: t['ACTIVITYESTIMATE'],
                season: t['SEASON'],
                state: t['STATENAME'],
                week: +t['WEEK']
            }
        });
        var nestedData = d3.nest().key(function (d) {
            return d.state
        }).key(function (d) {
            return d.season
        }).entries(processedData);

        var weekOne = nestedData[13]; // 3 seasons
        console.log(nestedData);
        nestedData.forEach(function (i) {
            datamap.set(i.key, i);
        });

        var geojson = L.geoJson(statesData, {style: style}).addTo(map);


        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = ['Sporadic', 'Local Activity', 'Regional', 'Widespread', 'No activity/report'],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colorActivity(grades[i]) + '"></i> ' +
                    grades[i]  + '<br>' ;
            }

            return div;
        };

        legend.addTo(map);

        setInterval(function () {
            var showYear = (season<=smax)? (2009+season):(2009+smax);
            d3.select('#showYear').text(showYear);

            if(season<=smax){
                geojson.setStyle(style);
                season ++;
            } else if(season>smax){
                season=smax;
                geojson.setStyle(style);
                season = 0;
            }
        }, 1000);

    });

    function colorActivity(str) {
        if(str =='Sporadic'){
            return '#FED976'
        } else if(str=='Local Activity'){
            return '#FD8D3C'
        } else if(str=='Regional'){
            return '#E31A1C'
        } else if(str =='Widespread'){
            return '#800026'
        } else{
            return '#fbff1e'
        }
    }


    function style(feature) {
        var newObj;
        var obj = datamap.get(feature.properties.name); //name to value
        var allweek = obj.values[season].values;
        //console.log(obj);
        allweek.forEach(function (t) {
            if(+(t.week) == week)
                newObj = {
                    fillColor: colorActivity(t.activity),
                    //fillColor: 'red',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
        });
        return newObj;
    }


    // run code
    init();
})();
