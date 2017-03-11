// run with  python -m SimpleHTTPServer

var mymap;

var initLatLong = [51.505, -0.09];
var zoomLevel = 10.5;

var iconGroups = {};
var companyIconGroups = {};

var uniDisplayedLines = {};
var companyDisplayedLines = {};
var highlightedIcons = {};

var hallsColour = '#b2b2ff';
var hallsHiglightedColour = "#0000FF";
var companiesColour = 'red';
var unisColour = 'black';

var hallsOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor: hallsColour
}

var companiesOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor: 'red'
}

var unisOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor: 'black'
}

function addKey(map) {
  var keyUI = L.control({position: 'topleft'});

  keyUI.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  keyUI.update = function (props) {
    this._div.innerHTML = '<h4>Key</h4>' +
    '<table>' +
    '<tr><td><b>Halls:</b> </td><td><i class="fa fa-circle circle-left-padding" style="color:' + hallsColour + '"></i></td></tr>' +
    '<tr><td><b>Universities:</b> </td><td><i class="fa fa-circle circle-left-padding" style="color:' + unisColour + '"></i></td></tr>' +
    '<tr><td><b>Companies:</b> </td><td><i class="fa fa-circle circle-left-padding" style="color:' + companiesColour + '"></i></td></tr>' +
    '</table>'
  };

  keyUI.addTo(map);
}

function generateControls(universities, map) {
  console.log(universities);
  universities = _.sortBy(universities);
  console.log(universities);

  var string = "";

  var arrayLength = universities.length;
  for (var i = 0; i < arrayLength; i++) {
    string = string + '<input type="checkbox" name="university" value="' +
    universities[i] + '">' + universities[i] + '<br>'
  }

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>Halls Selection</h4>' +
    '<form action="">' + string + '</form>'
  };

  info.addTo(map);
}

// add to object of universities and their halls
function addToUnisWithHalls(unisWithHalls, hall, hallMarker, type) {
  if (unisWithHalls[hall.University]) {
    if (unisWithHalls[hall.University][type]) {
      unisWithHalls[hall.University][type].push(hallMarker);
    } else {
      unisWithHalls[hall.University][type] = [hallMarker];
    }
  } else {
    unisWithHalls[hall.University] = {};
    unisWithHalls[hall.University][type] = [hallMarker];
  }
}

function addToCompaniesWithHalls(companyWithHalls, hall, hallMarker, type) {
  var company = hall["Owned by"];
  if (companyWithHalls[company]) {
    if (companyWithHalls[company][type]){
      companyWithHalls[company][type].push(hallMarker);
    } else {
      companyWithHalls[company][type] = [hallMarker];
    }
  } else {
    companyWithHalls[company] = {};
    companyWithHalls[company][type] = [hallMarker];
  }
}

function showCompanyLinks(company) {
  companyIconGroups[company]["lines"].eachLayer(function (layer) {
    if (mymap.hasLayer(layer) && !uniDisplayedLines[layer._leaflet_id]) {
      mymap.removeLayer(layer);
      delete companyDisplayedLines[layer._leaflet_id];
    } else {
      mymap.addLayer(layer);
      companyDisplayedLines[layer._leaflet_id] = layer;
    }
  });
  // refactor out colour variable strings
  companyIconGroups[company]["halls"].eachLayer(function (layer) {
    if (!highlightedIcons[layer._leaflet_id]) {
      // if already highlighted
      if (layer._icon.style.borderColor == "rgb(0, 0, 255)") {
        // remove highlight
        layer._icon.style.borderColor = "rgb(178, 178, 255)";
      } else {
        // otherwise add highlight
        layer._icon.style.borderColor = "rgb(0, 0, 255)";
      }
    }
  });
}

// generate groups from object of universities and their halls
function generateLayerGroups(layers) {
  $.each(layers, function(key, uni) {
    var uniHallsLayer = L.layerGroup(uni["halls"]);
    var uniLinesLayer = L.layerGroup(uni["lines"]);
    var uniSelfLinesLayer = L.layerGroup(uni["uni-lines"]);
    var uniLayer = {};
    uniLayer["halls"] = uniHallsLayer;
    uniLayer["lines"] = uniLinesLayer;
    uniLayer["uni-lines"] = uniSelfLinesLayer;
    iconGroups[key] = uniLayer;
  });
}

// generate groups from object of companies and their halls
function generateCompanyGroups(companiesWithHalls) {
  $.each(companiesWithHalls, function(key, company) {
    var companyHallsLayer = L.layerGroup(company["halls"]);
    var companyLinesLayer = L.layerGroup(company["lines"]);
    var companyLayer = {};
    companyLayer["halls"] = companyHallsLayer;
    companyLayer["lines"] = companyLinesLayer;
    companyIconGroups[key] = companyLayer;
  });
  console.log(companyIconGroups);
}

// adds and removes icons from controls
function updateIcons(elem) {
  var uni = elem.value;
  if (!elem.checked) {
    iconGroups[uni]["lines"].eachLayer(function (layer) {
        if (!companyDisplayedLines[layer._leaflet_id]) {
          mymap.removeLayer(layer);
        }
        delete uniDisplayedLines[layer._leaflet_id];
    });
    iconGroups[uni]["uni-lines"].eachLayer(function (layer) {
        mymap.removeLayer(layer);
        delete uniDisplayedLines[layer._leaflet_id];
    });
    iconGroups[uni]["halls"].eachLayer(function (layer) {
        layer._icon.style.borderColor = "#b2b2ff";
        highlightedIcons[layer._leaflet_id] = layer;
    });
  } else {
    iconGroups[uni]["lines"].eachLayer(function (layer) {
        mymap.addLayer(layer);
        uniDisplayedLines[layer._leaflet_id] = layer;
    });
    iconGroups[uni]["uni-lines"].eachLayer(function (layer) {
        mymap.addLayer(layer);
        uniDisplayedLines[layer._leaflet_id] = layer;
    });
    iconGroups[uni]["halls"].eachLayer(function (layer) {
        layer._icon.style.borderColor = "#0000FF";
        delete highlightedIcons[layer._leaflet_id];
    });
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isCoordinates(coord) {
  return isNumeric(coord[0]) && isNumeric(coord[1]);
}

// given a leaftlet map, loads json and displays data
function loadMap(map) {
  var universities = [];
  var companiesSeen = [];
  var unisWithHalls = {};
  var companiesWithHalls = {};

  // remove nested ajax
  $.getJSON("halls.json", function(halls) {
    $.getJSON("companies.json", function(companies) {
      $.getJSON("universities.json", function(uni_map_data) {

        // add unis to map
        $.each(uni_map_data, function(key, uni) {
          var latLong = [uni.Latitude, uni.Longitude];
          var uniMarker = L.marker(latLong, {
            icon: L.BeautifyIcon.icon(unisOptions)
          }).addTo(map);
          uniMarker.bindPopup(key + "<br/>" + uni.Address);
        });

        $.each(halls, function(key, hall) {
          // get company hall is owned by
          var company = companies[hall["Owned by"]];
          var uniLatLong = [hall.Latitude, hall.Longitude];

          if (isCoordinates(uniLatLong)) {
            // add universities to array
            if (!_.includes(universities, hall.University)) {
              universities.push(hall.University)
            }

            // create hall marker
            var hallMarker = L.marker(uniLatLong, {
              icon: L.BeautifyIcon.icon(hallsOptions)
            }).addTo(map);
            hallMarker.bindPopup(hall.University + "<br/>" + hall.Hall + "<br/>" + hall.Address);

            // add hall marker to univerity with halls object
            addToUnisWithHalls(unisWithHalls, hall, hallMarker, "halls");

            // if privately owned, display company
            if (company) {

              var companyLatLong = [company.Latitude, company.Longitude];
              if (isCoordinates(companyLatLong)) {

                if (!_.includes(companiesSeen, hall["Owned by"])) {
                  companiesSeen.push(hall["Owned by"]);
                  // create company marker
                  var companyMarker = L.marker(companyLatLong, {
                    icon: L.BeautifyIcon.icon(companiesOptions)
                  }).on('click', function() {
                    showCompanyLinks(hall["Owned by"]);
                  });
                  companyMarker.addTo(map);
                  companyMarker.bindPopup(hall["Owned by"] + "<br/>" + company["Head office address"]);
                }

                // create line between company and hall
                var tempPolygon = L.polyline(
                  [uniLatLong, [company.Latitude, company.Longitude]]
                );

                // add line to university hall structure
                addToUnisWithHalls(unisWithHalls, hall, tempPolygon, "lines");
                // add hall marker to company with halls object
                addToCompaniesWithHalls(companiesWithHalls, hall, tempPolygon, "lines");
                addToCompaniesWithHalls(companiesWithHalls, hall, hallMarker, "halls");
              }
            } else {
              // console.log(hall["Owned by"]);
              if (hall["Owned by"] === "University") {
                // console.log(hall.University);
                var uniCampus = uni_map_data[hall.University];
                var uniPolyline = L.polyline(
                  [uniLatLong, [uniCampus.Latitude, uniCampus.Longitude]]
                );
                var decorator = L.polylineDecorator(uniPolyline, {
                    patterns: [
                        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                        {offset: 0, repeat: 20, symbol: L.Symbol.dash({pixelSize: 10})}
                    ]
                });
                addToUnisWithHalls(unisWithHalls, hall, decorator, "uni-lines");
              }
            }
          }
        });
        // console.log(companiesSeen);
        generateControls(universities, map);
        addKey(map)
        generateLayerGroups(unisWithHalls);
        generateCompanyGroups(companiesWithHalls);
        $("input[name='university']").click(function() {
            updateIcons(this);
        });
      });
    });
  });
}

$(document).ready(function () {
  // initialise map
  mymap = L.map('map').setView(initLatLong, zoomLevel);

  // add tile layer to map
  // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	subdomains: 'abcd',
  	minZoom: 0,
  	maxZoom: 20,
  	ext: 'png'
  }).addTo(mymap);

  loadMap(mymap);

});
