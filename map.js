// run with  python -m SimpleHTTPServer
$(document).ready(function () {
  // initialise map
  mymap = L.map('map').setView([51.505, -0.09], 10);

  // var coords = [51.5, -0.09];
  // var marker = L.marker(coords).addTo(mymap);

  // add tile layer to map
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  loadMap(mymap);

});


var mymap;

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

function generateGroups(layers) {
  $.each(layers, function(key, uni) {
    var uniLayer = L.layerGroup(uni.halls);
    iconGroups[key] = uniLayer;
  });
}

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

function loadMap(map) {
  var universities = [];
  var uniLayers = {};
  // remove nested ajax
  $.getJSON("halls.json", function(data) {
    $.getJSON("companies.json", function(companies) {

      // console.log(companies);
      $.each(data, function(key, val) {
        if (isNumeric(val.Latitude) && isNumeric(val.Longitude)) {
          if (!_.includes(universities, val.University)) {
            universities.push(val.University)
          }
          var company = companies[val["Owned by"]];
          var hallMarker = L.marker([val.Latitude, val.Longitude], {
            icon: L.BeautifyIcon.icon(hallsOptions)
          }).addTo(map);
          if (uniLayers[val.University]) {
            if (uniLayers[val.University].halls) {
              uniLayers[val.University].halls.push(hallMarker);
            } else {
              uniLayers[val.University].halls = [hallMarker];
            }
          } else {
            uniLayers[val.University] = {};
            uniLayers[val.University].halls = [hallMarker];
          }
          hallMarker.bindPopup(val.University + "<br/>" + val.Hall + "<br/>" + val.Address);
          if (company) {
            if (isNumeric(company.Latitude) && isNumeric(company.Latitude)) {
              var companyMarker = L.marker([company.Latitude, company.Longitude], {
                icon: L.BeautifyIcon.icon(companiesOptions)
              }).addTo(map);

              companyMarker.bindPopup(val["Owned by"] + "<br/>" + company["Head office address"]);
              var tempPolygon = L.polyline(
                [[val.Latitude, val.Longitude], [company.Latitude, company.Longitude]]
              ).addTo(map);
              uniLayers[val.University].halls.push(tempPolygon);
            }
          }
        }
      });

      generateControls(universities, map);
      generateGroups(uniLayers);
      $("input[name='university']").click(function() {
          updateIcons(this);
      });
      hideAllIcons();
    });
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
