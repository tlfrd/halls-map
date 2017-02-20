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
function addToUniHallsList(uniLayers, hall, halls, hallMarker) {
  if (uniLayers[hall.University]) {
    if (uniLayers[hall.University].halls) {
      uniLayers[hall.University].halls.push(hallMarker);
    } else {
      uniLayers[hall.University].halls = [hallMarker];
    }
  } else {
    uniLayers[hall.University] = {};
    uniLayers[hall.University].halls = [hallMarker];
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
  var unisWithHalls = {};
  // remove nested ajax
  $.getJSON("halls.json", function(halls) {
    $.getJSON("companies.json", function(companies) {
      $.each(halls, function(key, hall) {
        // get company hall is owned by
        var company = companies[hall["Owned by"]];
        var uniLatLong = [hall.Latitude, hall.Longitude];
        var companyLatLong = [company.Latitude, company.Longitude];

        if (isCoordinates(uniLatLong) {
          // add universities to array
          if (!_.includes(universities, hall.University)) {
            universities.push(hall.University)
          }

          // create hall marker
          var hallMarker = L.marker(uniLatLong, {
            icon: L.BeautifyIcon.icon(hallsOptions)
          });
          hallMarker.bindPopup(hall.University + "<br/>" + hall.Hall + "<br/>" + hall.Address);

          // add hall marker to univerity with halls objects
          addToUniHallsList(uniWithHalls, hall, halls, hallMarker);

          // if privately owned, display company
          // REFACTOR SO NO DUPLICATES OF COMPANY ICONS
          if (company) {
            if (isCoordinates(companyLatLong)) {
              // create company marker
              var companyMarker = L.marker(companyLatLong, {
                icon: L.BeautifyIcon.icon(companiesOptions)
              }).addTo(map);
              companyMarker.bindPopup(val["Owned by"] + "<br/>" + company["Head office address"]);

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

      generateControls(universities, map);
      generateGroups(uniWithHalls);
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
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  loadMap(mymap);

});
