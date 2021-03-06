//Error checking when connecting to google map api
$.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAZJYwSB-hwX7EXVNXtWo7HSjyPaJNmrWc&callback=initMap")
    .fail(function(jqxhr, settings, exception) {
        alert('Failed to load google api !!! Try again later');
    });

var map; //Used for storing google map object
//Details of various locations
var locations = [{
        "name": "Marari Beach",
        'location': {
            'lat': 9.601583,
            'lng': 76.298332
        },
        'show': true,
        'para': ''
    },
    {
        "name": "Munnar Tea Mueseum",
        'location': {
            'lat': 10.094097,
            'lng': 77.050676
        },
        'show': true,
        'id': 1
    },
    {
        "name": "Eravikulam National Park",
        'location': {
            'lat': 10.115125,
            'lng': 77.079471
        },
        'show': true,
        'id': 2
    },
    {
        "name": "Chimmony Wildlife Sanctuary",
        'location': {
            'lat': 10.431043,
            'lng': 76.491009
        },
        'show': true,
        'id': 3
    },
    {
        "name": "Vadakkumnathan Temple",
        'location': {
            'lat': 10.524317,
            'lng': 76.214456
        },
        'show': true,
        'id': 4
    },
    {
        "name": "Padmanabhaswamy Temple",
        'location': {
            'lat': 8.482778,
            'lng': 76.943591
        },
        'show': true,
        'id': 5
    },
    {
        "name": "Muzhappilangad Beach",
        'location': {
            'lat': 11.798898,
            'lng': 75.440431
        },
        'show': true,
        'id': 6
    },
    {
        "name": "Thusharagiri Falls",
        'location': {
            'lat': 11.472841,
            'lng': 76.054114
        },
        'show': true,
        'id': 7
    },
    {
        "name": "Soochipara Falls",
        'location': {
            'lat': 11.512736,
            'lng': 76.164376
        },
        'show': true,
        'id': 8
    },
    {
        "name": "Bekal Fort",
        'location': {
            'lat': 12.392613,
            'lng': 75.033058
        },
        'show': true,
        'id': 9
    }
];
var len = locations.length;
var mapOptions = {};
var populateInfoWindow;
var largeInfowindow;
//Used to initilalize google map
function initMap() {
    mapOptions = {
        disableDefaultUI: true,
        draggable: true,
        zoom: 7,
        center: new google.maps.LatLng(10.524317, 76.214456)
    };
    //Sets zoomlevel based on wondow size
    var size = $(window).width();
    if (size < 768) {
        mapOptions.zoom = 6;
    } else if (size >= 700) {
        mapOptions.zoom = 7;
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    //Adds a marker object to locations
    locations.forEach(function(location) {
        var marker = location.marker = new google.maps.Marker({
            icon: 'images/mark.png',
            title: location.name,
            position: location.location,
            overviewMapControl: true,
            animation: google.maps.Animation.DROP
        });
        bounds.extend(marker.position);
        //Controls bounce animation
        marker.addListener('click', function() {
            if (marker.getAnimation()) {
                marker.setAnimation(null);
            } else {
                populateInfoWindow(this, largeInfowindow);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                stopAnimation(marker);
            }
        });

        //For infowindow
        populateInfoWindow = function(marker, infowindow) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(marker);
            infowindow.setContent('');
            infowindow.marker = marker;
            //Used for taking data using wiki api (a paragraph, a url based on place entrry)
            function wiki(wikidata) {
                wikidata = wikidata.replace(/ /g, '');
                var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikidata + '&callback=res&limit=10&namespace=0&format=json';
                //Calls api using ajax
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    success: function(response) {
                        var para = response[2].toString().substring(0, 50);
                        var link = response[3][0].toString();
                        infowindow.setContent('    <div class="info_container"><div class="info_title">' + marker.title + '</div><div><p class="info_para">' + para + '...</p></div><div><a href=' + link + ">" + link + '</a></div</div>');
                    }
                }).fail(function() {
                    alert('Failed to load wiki api !!! Try again later');
                });
            }
            wiki(marker.title);
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                infowindow.close();
            });
        };

        function stopAnimation(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1400);
        }
    });
    toggle();

}
//used to diaplay or hide markers based on boolean value show
function toggle() {
    locations.forEach(function(location) {
        if (location.marker) {
            location.marker.setMap(location.show === true ? map : null);
        }
    });
}
//knockout view model
var vm = function() {
    var self = this;
    self.loc = ko.observableArray(locations);
    self.query = ko.observable('');
    self.filteredloc = ko.computed(function() {
        var z = 0;
        var filter = self.query().toLowerCase();
        if (!filter) {
            for (var e = 0; e < len; e++) {
                locations[e].show = true;
            }
            toggle();
            return self.loc();
        } else {
            return ko.utils.arrayFilter(self.loc(), function(item) {
                locations[z].show = item.name.toLowerCase().indexOf(filter) !== -1;
                toggle();
                z++;
                return locations[z - 1].show;
            });
        }
    });
};
ko.applyBindings(new vm());
//Displays and hides list
function disp() {
    Object.assign(content_container.style, {
        zIndex: '2',
        opacity: '1',
        transition: 'all 0.3s ease-out'
    });
}

function mask() {
    Object.assign(content_container.style, {
        transition: 'all 0.3s ease-in',
        opacity: '0',
        zIndex: '0'
    });
}

//Function for resizing map based on screen size
function resetMap() {
    var windowWidth = $(window).width();
    if (windowWidth < 768) {
        map.setZoom(6);
        map.setCenter(mapOptions.center);
    } else if (windowWidth >= 768) {
        map.setZoom(7);
        map.setCenter(mapOptions.center);
    }
}
$(window).resize(function() {
    resetMap();
});

//Zooms and open infowindow when a list entry is clicked
function point(data) {
    var id = data.id;
    id = (id === undefined) ? 0 : id;
    map.setZoom(16);
    map.panTo(locations[id].marker.getPosition());
    populateInfoWindow(locations[id].marker, largeInfowindow);
}