// run with  python -m SimpleHTTPServer

var mymap;

var initLatLong = [51.505, -0.09];
var zoomLevel = 12;

var drop_control_up = false;

var allMarkers = [];

var iconGroups = {};
var companyIconGroups = {};
var uniMarkers = {};

var uniDisplayedLines = {};
var companyDisplayedLines = {};
var uniHighlightedIcons = {};
var companyHighlightedIcons = {};

var hallsColour = 'rgb(232, 0, 0)';
var hallsHiglightedColour = 'rgb(255, 154, 154)';
var companiesColour = 'black';
var unisColour = '#0074e8';

var hallsOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor: hallsColour
}

var companiesOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor: companiesColour
}

var unisOptions = {
  iconShape: 'circle-dot',
  borderWidth: 7,
  borderColor:  unisColour
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
    '<tr><td>Halls: </td><td><i class="fa fa-circle circle-left-padding" style="color:' + hallsColour + '"></i></td></tr>' +
    '<tr><td>Universities: </td><td><i class="fa fa-circle circle-left-padding" style="color:' + unisColour + '"></i></td></tr>' +
    '<tr><td>Companies: </td><td><i class="fa fa-circle circle-left-padding" style="color:' + companiesColour + '"></i></td></tr>' +
    '</table>'
  };

  keyUI.addTo(map);
}

function generateControls(universities, map, uni_map_data) {
  // sort universities alphabetically
  universities = _.sortBy(universities);

  var string = '<input type="checkbox" id="all" name="university_all" value="all">' +
  '<span class="universities-all">All</span></br><hr class="control-all-hr">';

  var arrayLength = universities.length;
  for (var i = 0; i < arrayLength; i++) {
    var displayedName = universities[i];
    if (uni_map_data[universities[i]]) {
      displayedName = uni_map_data[universities[i]].Shortname;
    }
    string = string + '<input type="checkbox" name="university" value="' +
    universities[i] + '"><span class="universities" value="' + universities[i] + '">' + displayedName + '</span></br>'
  }

  var info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>Halls Selection</h4>' +
    '<span class="drop-control">Display Menu <i class="fa fa-caret-down" aria-hidden="true"></i></span>' +
    '<form id="halls-selection" action="">' + string + '</form>'
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
    // if the lines are on the map
    if (mymap.hasLayer(layer)) {
      // check if not added by University and then remove
      if (!uniDisplayedLines[layer._leaflet_id]) {
        mymap.removeLayer(layer);
      }
      delete companyDisplayedLines[layer._leaflet_id];
    } else {
      mymap.addLayer(layer);
      companyDisplayedLines[layer._leaflet_id] = layer;
    }
  });
  companyIconGroups[company]["halls"].eachLayer(function (layer) {
    // if highlighted by company
    if (companyHighlightedIcons[layer._leaflet_id]) {
      // if not highlighted by uni
      if (!uniHighlightedIcons[layer._leaflet_id]) {
        layer._icon.style.borderColor = hallsColour;
      }
      delete companyHighlightedIcons[layer._leaflet_id];
    } else {
      companyHighlightedIcons[layer._leaflet_id] = layer;
      layer._icon.style.borderColor = hallsHiglightedColour;
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
}

// adds and removes icons from controls
function updateIcons(elem) {
  var uni = elem.value;
  if (!elem.checked) {
    // remove University lines and highlights
    iconGroups[uni]["lines"].eachLayer(function (layer) {
        // if not added by company then remove from map
        if (!companyDisplayedLines[layer._leaflet_id]) {
          mymap.removeLayer(layer);
        }
        // delete from uni displayed array
        delete uniDisplayedLines[layer._leaflet_id];
    });
    iconGroups[uni]["uni-lines"].eachLayer(function (layer) {
        mymap.removeLayer(layer);
        delete uniDisplayedLines[layer._leaflet_id];
    });
    iconGroups[uni]["halls"].eachLayer(function (layer) {
        // remove icon highlight, check if highlighted by company first
        if (!companyHighlightedIcons[layer._leaflet_id]) {
          layer._icon.style.borderColor = hallsColour;
        }
        delete uniHighlightedIcons[layer._leaflet_id];
    });
  } else {
    // adding University lines and highlights
    iconGroups[uni]["lines"].eachLayer(function (layer) {
        mymap.addLayer(layer);
        uniDisplayedLines[layer._leaflet_id] = layer;
    });
    iconGroups[uni]["uni-lines"].eachLayer(function (layer) {
        mymap.addLayer(layer);
        uniDisplayedLines[layer._leaflet_id] = layer;
    });
    iconGroups[uni]["halls"].eachLayer(function (layer) {
        // add highlight
        layer._icon.style.borderColor = hallsHiglightedColour;
        // add to highlighted by uni
        uniHighlightedIcons[layer._leaflet_id] = layer;
    });
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isCoordinates(coord) {
  return isNumeric(coord[0]) && isNumeric(coord[1]);
}

function dropControlLogic() {
  if (drop_control_up === false) {
    $("#halls-selection").show();
    $(".drop-control").html('Hide Menu <i class="fa fa-chevron-up" aria-hidden="true"></i>');
    drop_control_up = true;
  } else {
    $("#halls-selection").hide();
    $(".drop-control").html('Show Menu <i class="fa fa-chevron-down" aria-hidden="true"></i>');
    drop_control_up = false;
  }
}

function uniPopupInfo(uni_name, uni_info) {
  return "<b>University:</b> " + universityData[uni_name].Longname + "</br><b>Address:</b> " + uni_info.Address;
}

function hallPopupInfo(hall_info) {
  return "<b>Hall:</b> " + hall_info.Hall + "</br><b>University:</b> " + hall_info.University + "</br><b>Address:</b> " +  hall_info.Address;
}

function companyPopupInfo(company_name, company_info) {
  return "<b>Company:</b> " + company_name + "</br><b>Address:</b> " + company_info["Head office address"];
}

function addUniToMap(uni_name, uni_info, map) {
  var latLong = [uni_info.Latitude, uni_info.Longitude];

  var uniMarker = L.marker(latLong, {
    icon: L.BeautifyIcon.icon(unisOptions)
  }).addTo(map);

  uniMarker.bindPopup(uniPopupInfo(uni_name, uni_info));
  uniMarker.on('mouseover', function (e) {
    this.openPopup();
  });
  uniMarker.on('mouseout', function (e) {
    this.closePopup();
  });

  return uniMarker;
}

function addHallToMap(hall_info, map) {
  var latLong = [hall_info.Latitude, hall_info.Longitude];

  var hallMarker = L.marker(latLong, {
    icon: L.BeautifyIcon.icon(hallsOptions)
  }).addTo(map);

  hallMarker.bindPopup(hallPopupInfo(hall_info));
  hallMarker.on('mouseover', function (e) {
    this.openPopup();
  });
  hallMarker.on('mouseout', function (e) {
    this.closePopup();
  });

  return hallMarker;
}

function addCompanyToMap(company_info, hall_info, map) {
  var latLong = [company_info.Latitude, company_info.Longitude];

  var companyMarker = L.marker(latLong, {
    icon: L.BeautifyIcon.icon(companiesOptions)
  }).on('click', function() {
    showCompanyLinks(hall_info["Owned by"]);
  });

  companyMarker.addTo(map);
  companyMarker.bindPopup(companyPopupInfo(hall_info["Owned by"], company_info));
  companyMarker.on('mouseover', function (e) {
    this.openPopup();
  });
  companyMarker.on('mouseout', function (e) {
    this.closePopup();
  });

  return companyMarker;
}

function addAllIconsToArray(map) {
  map.eachLayer(function (layer) {
    if (layer._icon) {
      allMarkers.push(layer);
    }
  });
}

function fitAllIcons(map, icons_array) {
  var group = new L.featureGroup(icons_array);
  map.fitBounds(group.getBounds());
}

// given a leaftlet map, loads json and displays data
function loadMap(map) {
  var universities = [];
  var companiesSeen = [];
  var unisWithHalls = {};
  var companiesWithHalls = {};

  $.getJSON("halls.json", function(halls) {
    $.getJSON("companies.json", function(companies) {
      $.getJSON("universities.json", function(uni_map_data) {
        universityData = uni_map_data;

        // add unis to map
        $.each(uni_map_data, function(uni_name, uni_info) {
          var uniMarker = addUniToMap(uni_name, uni_info, map);
          uniMarkers[uni_name] = uniMarker;
        });

        $.each(halls, function(hall_name, hall_info) {
          // get company hall is owned by
          var company = companies[hall_info["Owned by"]];
          var hallLatLong = [hall_info.Latitude, hall_info.Longitude];

          if (isCoordinates(hallLatLong)) {
            // add universities to array
            // OLD - REMOVE THIS
            if (!_.includes(universities, hall_info.University)) {
              universities.push(hall_info.University)
            }

            // create hall marker and add to map
            var hallMarker = addHallToMap(hall_info, map);

            // add hall marker to univerity with halls object
            addToUnisWithHalls(unisWithHalls, hall_info, hallMarker, "halls");

            // if privately owned, display company
            if (company) {
              var companyLatLong = [company.Latitude, company.Longitude];
              if (isCoordinates(companyLatLong)) {

                if (!_.includes(companiesSeen, hall_info["Owned by"])) {
                  companiesSeen.push(hall_info["Owned by"]);
                  // create company marker and add to map
                  addCompanyToMap(company, hall_info, map);
                }

                // create line between company and hall
                var companyToHallLine = L.polyline(
                  [hallLatLong, [company.Latitude, company.Longitude]]
                );

                // add line to university hall structure
                addToUnisWithHalls(unisWithHalls, hall_info, companyToHallLine, "lines");
                // add hall marker to company with halls object
                addToCompaniesWithHalls(companiesWithHalls, hall_info, companyToHallLine, "lines");
                addToCompaniesWithHalls(companiesWithHalls, hall_info, hallMarker, "halls");
              }
            } else {
              if (hall_info["Owned by"] === "University") {
                var uniCampus = uni_map_data[hall_info.University];
                var uniToHallLine = L.polyline(
                  [hallLatLong, [uniCampus.Latitude, uniCampus.Longitude]]
                );
                var dottedUniToHallLine = L.polylineDecorator(uniToHallLine, {
                    patterns: [
                        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                        {offset: 0, repeat: 20, symbol: L.Symbol.dash({pixelSize: 10})}
                    ]
                });
                addToUnisWithHalls(unisWithHalls, hall_info, dottedUniToHallLine, "uni-lines");
              }
            }
          }
        });
        generateControls(universities, map, uni_map_data);
        addKey(map);
        generateLayerGroups(unisWithHalls);
        generateCompanyGroups(companiesWithHalls);
        addAllIconsToArray(map);

        L.control.zoom({
           position:'topleft'
        }).addTo(map);

        $("input[name='university']").change(function() {
            updateIcons(this);
        });

        $(".universities").click(function() {
            var universityName = $(this).attr("value");
            if (universityData = uni_map_data[universityName]) {
              var universityCoords = [universityData.Latitude, universityData.Longitude];
              map.flyTo(universityCoords);
              // map.on('zoomend', function() {
              //   uniMarkers[universityName].openPopup();
              // });
            }
            $("input[value=\"" + universityName + "\"]").prop('checked', true).change();
        });

        $(".universities").hover(function() {
          if (universityName = uniMarkers[$(this).attr("value")]) {
            uniMarkers[$(this).attr("value")].openPopup();
          }
        })

        $("input[name='university_all']").change(function() {
            if (!this.checked) {
              $("input[name='university']").prop('checked', false).change();
            } else {
              $("input[name='university']").prop('checked', true).change();
              fitAllIcons(map, allMarkers);
            }
        })

        $(".drop-control").click(function() {
          dropControlLogic();
        });
      });
    });
  });
}

$(document).ready(function () {
  // initialise map
  mymap = L.map('map', {zoomControl: false}).setView(initLatLong, zoomLevel);

  // add tile layer to map
  L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	subdomains: 'abcd',
  	minZoom: 0,
  	maxZoom: 20,
  	ext: 'png'
  }).addTo(mymap);

  loadMap(mymap);

});
