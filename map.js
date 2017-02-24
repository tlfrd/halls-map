// run with  python -m SimpleHTTPServer

var mymap;

var initLatLong = [51.505, -0.09];
var zoomLevel = 10;

var iconGroups = {};

var hallsOptions = {
  iconShape: 'doughnut',
  borderWidth: 5,
  borderColor: 'blue'
}

var companiesOptions = {
  iconShape: 'doughnut',
  borderWidth: 5,
  borderColor: 'red'
}

function generateControls(universities, map) {
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
function addToUnisWithHalls(unisWithHalls, hall, hallMarker) {
  if (unisWithHalls[hall.University]) {
    unisWithHalls[hall.University].halls.push(hallMarker);
  } else {
    unisWithHalls[hall.University] = {};
    unisWithHalls[hall.University].halls = [hallMarker];
  }
}

function addToCompaniesWithHalls(companyWithHalls, hall, hallMarker) {
  var company = hall["Owned by"];
  if (companyWithHalls[company]) {
    companyWithHalls[company].halls.push(hallMarker);
  } else {
    companyWithHalls[company] = {};
    companyWithHalls[company].halls = [hallMarker];
  }
}

// generate groups from object of universities and their halls
function generateGroups(layers) {
  $.each(layers, function(key, uni) {
    var uniLayer = L.layerGroup(uni.halls);
    iconGroups[key] = uniLayer;
  });
}

// adds and removes icons from controls
function updateIcons(elem) {
  var uni = elem.value;
  if (!elem.checked) {
    iconGroups[uni].eachLayer(function (layer) {
        mymap.removeLayer(layer);
    });
  } else {
    iconGroups[uni].eachLayer(function (layer) {
        mymap.addLayer(layer);
    });
  }
}

function hideAllIcons() {
  $.each(iconGroups, function(key, group) {
    group.eachLayer(function (layer) {
        mymap.removeLayer(layer);
    });
  });
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
          });
          hallMarker.bindPopup(hall.University + "<br/>" + hall.Hall + "<br/>" + hall.Address);

          // add hall marker to univerity with halls object
          addToUnisWithHalls(unisWithHalls, hall, hallMarker);

          // if privately owned, display company
          // REFACTOR SO NO DUPLICATES OF COMPANY ICONS
          if (company) {
            // add hall marker to company with halls object
            addToCompaniesWithHalls(companiesWithHalls, hall, hallMarker);

            var companyLatLong = [company.Latitude, company.Longitude];
            if (isCoordinates(companyLatLong)) {

              if (!_.includes(companiesSeen, hall["Owned by"])) {
                companiesSeen.push(hall["Owned by"]);
                // create company marker
                var companyMarker = L.marker(companyLatLong, {
                  icon: L.BeautifyIcon.icon(companiesOptions)
                }).addTo(map);
                companyMarker.bindPopup(hall["Owned by"] + "<br/>" + company["Head office address"]);
              }

              // create line between company and hall
              var tempPolygon = L.polyline(
                [uniLatLong, [company.Latitude, company.Longitude]]
              ).addTo(map);

              // add line to university hall structure
              unisWithHalls[hall.University].halls.push(tempPolygon);
            }
          }
        }
      });
      console.log(companiesSeen);
      generateControls(universities, map);
      generateGroups(unisWithHalls);
      $("input[name='university']").click(function() {
          updateIcons(this);
      });
      hideAllIcons();
    });
  });
}

$(document).ready(function () {
  // initialise map
  mymap = L.map('map').setView(initLatLong, zoomLevel);

  // add tile layer to map
  // L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGxmcmQiLCJhIjoiY2lyZzR0dms1MDAwd2o3bTU4OWM4bG5sbiJ9.GtEjgTigzfBM-2J9x2Gf0w', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  }).addTo(mymap);

  loadMap(mymap);

});
