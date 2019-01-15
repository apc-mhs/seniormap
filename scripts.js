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
        fullscreenControl: true,
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

function details(institution) {
    if (popup) popup.setMap(null);
    var info = document.createElement('div');
    var institutionContainer = document.createElement('div');
    institutionContainer.className = 'institution-container';
    var institutionType = document.createElement('p'),
        institutionName = document.createElement('h3');
        institutionLogo = document.createElement('img'),
    institutionName.textContent = institution.name;
    institutionType.textContent = institution.type;
    institutionLogo.src = logos[institution.name] || '';
    institutionContainer.appendChild(institutionName);
    institutionContainer.appendChild(institutionType);
    institutionContainer.appendChild(institutionLogo);
    info.appendChild(institutionContainer);
    for (student of institution.students) {
        var studentPhoto = document.createElement('img'),
            studentName = document.createElement('p'),
            studentMajor = document.createElement('p');
        studentPhoto.src = 'portraits/' + student.name.replace(' ', '_') + '.jpg';
        studentName.textContent = student.name;
        studentName.className = 'student-name';
        studentMajor.textContent = student.major;
        studentMajor.className = 'student-major';
        var studentContainer = document.createElement('div');
        studentContainer.className = 'student-container';
        studentContainer.appendChild(studentPhoto);
        studentContainer.appendChild(studentName);
        studentContainer.appendChild(studentMajor);
        info.appendChild(studentContainer);
    }
    popup = new Popup(new google.maps.LatLng(institution.position.lat(), institution.position.lng()), info);
    popup.setMap(map);
}
