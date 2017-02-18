// run with  python -m SimpleHTTPServer
$(document).ready(function () {
  // initialise map
  var mymap = L.map('map').setView([51.505, -0.09], 12);

  // var coords = [51.5, -0.09];
  // var marker = L.marker(coords).addTo(mymap);

  // add tile layer to map
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);

  loadMap(mymap);

});

var hallsOptions = {
  iconShape: 'circle-dot',
  borderWidth: 5,
  borderColor: 'green'
}

var companiesOptions = {
  iconShape: 'circle-dot',
  borderWidth: 5,
  borderColor: 'red'
}

function generateControls(universities, map) {
  var string = "";
  console.log(universities);

  var arrayLength = universities.length;
  for (var i = 0; i < arrayLength; i++) {
    string = string + '<input type="checkbox" name="university" value="' +
    universities[i] + '"checked>' + universities[i] + '<br>'
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

function loadMap(map) {
  var universities = [];
  // remove nested ajax
  $.getJSON("halls.json", function(data) {
    $.getJSON("companies.json", function(companies) {

      // console.log(companies);
      $.each(data, function(key, val) {
        if (isNumeric(val.Latitude) && isNumeric(val.Longitude)) {
          if (!_.includes(universities, val.University)) {
            universities.push(val.University)
          }
          // companies.(val.)
          var company = companies[val["Owned by"]];
          var tempMarker = L.marker([val.Latitude, val.Longitude], {
            icon: L.BeautifyIcon.icon(hallsOptions)
          }).addTo(map);
          tempMarker.bindPopup(val.University + "<br/>" + val.Hall + "<br/>" + val.Address).openPopup();
          if (company) {
            if (isNumeric(company.Latitude) && isNumeric(company.Latitude)) {
              var tempMarker2 = L.marker([company.Latitude, company.Longitude], {
                icon: L.BeautifyIcon.icon(companiesOptions)
              }).addTo(map);
              var tempPolygon = L.polygon([[val.Latitude, val.Longitude], [company.Latitude, company.Longitude]]).addTo(map);
            }
          }
        }
      });

      generateControls(universities, map);
    });
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
