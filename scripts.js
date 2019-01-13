var logos = {
    // TODO: It would be nicer to not hotlink literally all of these
    'Yale University': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Yale_University_Shield_1.svg/200px-Yale_University_Shield_1.svg.png',
    'Princeton University': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Princeton_shield.svg/200px-Princeton_shield.svg.png',
    'University of Virginia': 'https://d9tyu2epg3boq.cloudfront.net/institutions/uva.jpg',
};

var map, popup, Popup;

// Called by Maps API upon loading.
function initMap() {
    definePopupClass();

    map = new google.maps.Map(document.getElementById('map'), { // Define Map Settings
        center: {
            lat: 35,
            lng: -98
        },
        zoom: 4,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        backgroundColor: '#333333',
        styles: [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{
                    color: '#222222'
                }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{
                    color: '#444444'
                }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [
                    {
                        color: '#444444'
                    },
                    {
                        lightness: -37
                    }
                ]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{
                    color: '#666666'
                }]
            },
            {
                elementType: 'labels.text.stroke',
                stylers: [
                    {
                        visibility: 'on'
                    },
                    {
                        color: '#666666'
                    },
                    {
                        weight: 2
                    },
                    {
                        gamma: 0.84
                    }
                ]
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{
                    color: '#ffffff'
                }]
            },
            {
                featureType: 'administrative',
                elementType: 'geometry',
                stylers: [
                    {
                        weight: 0.6
                    },
                    {
                        color: '#d12727'
                    }
                ]
            },
            {
                elementType: 'labels.icon',
                stylers: [{
                    visibility: 'off'
                }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{
                    color: '#333333'
                }]
            }
        ]
    });

    // TODO: Do this asynchronously
    Tabletop.init({
        key: '1oHzFViH9gI3rwXNeHqYLOiIIYo57m0n6EMPll5kZJRE',
        callback: function(students, tabletop) {
            var institutions = {};
            // TODO: Stop getting sheet data in array
            for (student of tabletop.sheets()['raw'].toArray()) {
                if (!institutions[student[3]]) { // If the institution isn't already in the list
                    institutions[student[3]] = {
                        name: student[3],
                        type: student[2],
                        students: [],
                        position: {
                            lat: parseFloat(student[6]),
                            lng: parseFloat(student[7]),
                        },
                    }
                }
                institutions[student[3]].students.push({
                    name: student[4] + ' ' + student[5],
                    //photo: ,
                    major: student[8],
                });
            }
            for (name in institutions) {
                var marker = new google.maps.Marker(institutions[name]);
                google.maps.event.addListener(marker, 'click', function() {
                    details(this);
                });
                marker.setMap(map);
            }
        },
        simpleSheet: true,
    });
}

function definePopupClass() {
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} content
     * @constructor
     * @extends {google.maps.OverlayView}
     */
    Popup = function(position, content) {
        this.position = position;

        content.classList.add('popup-bubble-content');

        var pixelOffset = document.createElement('div');
        pixelOffset.classList.add('popup-bubble-anchor');
        pixelOffset.appendChild(content);

        this.anchor = document.createElement('div');
        this.anchor.classList.add('popup-tip-anchor');
        this.anchor.appendChild(pixelOffset);

        // Optionally stop clicks, etc., from bubbling up to the map.
        this.stopEventPropagation();
    };
    // NOTE: google.maps.OverlayView is only defined once the Maps API has
    // loaded. That is why Popup is defined inside initMap().
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);

    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function() {
        this.getPanes().floatPane.appendChild(this.anchor);
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function() {
        if (this.anchor.parentElement) {
            this.anchor.parentElement.removeChild(this.anchor);
        }
    };

    /** Called when the popup needs to draw itself. */
    Popup.prototype.draw = function() {
        var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
        this.anchor.style.left = divPosition.x + 'px';
        this.anchor.style.top = divPosition.y + 'px';
    };

    /** Stops clicks/drags from bubbling up to the map. */
    Popup.prototype.stopEventPropagation = function() {
        var anchor = this.anchor;
        anchor.style.cursor = 'auto';

        ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
            'pointerdown']
            .forEach(function(event) {
                anchor.addEventListener(event, function(e) {
                    e.stopPropagation();
                });
            });
    };
}


function details(institution) {
    //if (popup) popup.close();
    var institutionLogo = document.createElement('img'),
        institutionType = document.createElement('p'),
        institutionName = document.createElement('p');
    institutionLogo.src = logos[institution.name];
    institutionName.textContent = institution.name;
    institutionType.textContent = institution.type;
    var info = document.createElement('div');
    info.id = 'info';
    info.appendChild(institutionLogo);
    info.appendChild(institutionName);
    info.appendChild(institutionType);
    for (student of institution.students) {
        var studentPhoto = document.createElement('img'),
            studentName = document.createElement('p'),
            studentMajor = document.createElement('p');
        studentPhoto.src = '';
        studentName.textContent = student.name;
        studentMajor.textContent = student.major;
        var studentContainer = document.createElement('div');
        studentContainer.className = 'student';
        studentContainer.appendChild(studentPhoto);
        studentContainer.appendChild(studentName);
        studentContainer.appendChild(studentMajor);
        info.appendChild(studentContainer);
    }
    popup = new Popup(new google.maps.LatLng(institution.position.lat(), institution.position.lng()), info);
    popup.setMap(map);
}
