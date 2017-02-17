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

function loadMap(map) {
  // remove nested ajax
  $.getJSON("halls.json", function(data) {
    $.getJSON("companies.json", function(companies) {

      console.log(companies);
      $.each(data, function(key, val) {
        if (isNumeric(val.Latitude) && isNumeric(val.Longitude)) {
          // companies.(val.)
          var company = companies[val["Owned by"]];
          var tempMarker = L.circle([val.Latitude, val.Longitude], {
              color: 'red',
              fillColor: 'red',
              fillOpacity: 0.5,
              radius: 100
          }).addTo(map);
          tempMarker.bindPopup(val.University + "<br/>" + val.Hall + "<br/>" + val.Address).openPopup();
          if (company) {
            if (isNumeric(company.Latitude) && isNumeric(company.Latitude)) {
              var tempMarker2 = L.circle([company.Latitude, company.Longitude], {
                  color: 'blue',
                  fillColor: 'blue',
                  fillOpacity: 0.5,
                  radius: 100
              }).addTo(map);
              var tempPolygon = L.polygon([[val.Latitude, val.Longitude], [company.Latitude, company.Longitude]]).addTo(map);
            }
          }
        }
      });
    });
  });
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
