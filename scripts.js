var map, popup, Popup, markers = [];
var mapElement = document.getElementById('map');
var yearSelect = document.getElementById('year-select');
var currentYear = '2020';
var popupOpen = false;

var dataDocuments = {
    '2019': '1oHzFViH9gI3rwXNeHqYLOiIIYo57m0n6EMPll5kZJRE',
    '2020': '1aPQuyvb8Y1SH37kkD1eVFftkscHB63cnU92HQeuR9n4'
}

var downloadedYears = {};

// Called by Maps API upon loading.
function initMap() {
    definePopupClass();

    map = new google.maps.Map(mapElement, { // Define Map Settings
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

    fetchTabletopData(currentYear).then(() => placeMarkers(downloadedYears[currentYear]));
}

function fetchTabletopData(year) {
    var fetchFunction = function fetchData(resolve, reject) {
        if (downloadedYears[year] !== undefined) {
            clearMarkers();
            resolve();
            return;
        }

        console.log('Running Tabletop query...');
        // TODO: Do this asynchronously
        Tabletop.init({
            key: dataDocuments[year],
            error: function() {
                reject();
            },
            callback: function(data, tabletop) {
                clearMarkers();
                var institutions = buildMarkers(tabletop)
                // Save the data in an object for caching purposes
                downloadedYears[year] = institutions;
                resolve();
            },
            simpleSheet: true,
        });
    }

    return new Promise(fetchFunction);
}

function refreshMap(year) {
    mapElement.classList.add('refreshing');
    clearPopups();
    Promise.all([
        // Minimum delay of 300ms before, then, placing new markers
        Promise.all([
            fetchTabletopData(year),
            sleep(300)
        ]).then(() => placeMarkers(downloadedYears[year])),
        transitionEnd(mapElement, 'filter')
    ]).then(function() {
        mapElement.classList.remove('refreshing');
    });
}

function clearPopups() {
    if (popup) popup.setMap(null);
}

function buildMarkers(tabletop) {
    var institutions = {};
    var coordinates = {};
    // Turn 2D list into easily-subscriptable object
    for (institution of tabletop.sheets('coordinates').toArray()) {
        coordinates[institution[0]] = {
            lat: parseFloat(institution[1]),
            lng: parseFloat(institution[2]),
        };
    }
    // TODO: Stop getting sheet data in array
    // I messed up the ordering of the data in the years 2019 and 2020
    // Now we have to use the names of each field to extract info rather than position...
    for (student of tabletop.sheets('raw').all()) {
        if (!institutions[student['Institution name']]) { // If the institution isn't already in the list
            if (!coordinates[student['Institution name']]) {
                console.error('No location data found for Institution: ' + student['Institution name']);
            }

            institutions[student['Institution name'].trim()] = {
                name: student['Institution name'].trim(),
                students: [],
                position: coordinates[student['Institution name'].trim()],
            }
        }
        institutions[student['Institution name'].trim()].students.push({
            name: student['First name'].trim() + ' ' + student['Last name'].trim(),
            major: student['Intended major(s) or field(s) of study'].trim(),
        });
    }

    for (institution of tabletop.sheets('logos').all()) {
        if (institutions[institution.name]) {
            institutions[institution.name].logo = institution.logo;
        }
    }

    console.log(institutions);
    return institutions;
}

function placeMarkers(institutions) {
    for (name in institutions) {
        //console.log('Creating marker for ' + name + ' with ' + institutions[name].students.length + ' student(s).');
        var marker = new google.maps.Marker(institutions[name]);
        google.maps.event.addListener(marker, 'click', function() {
            details(this);
        });
        marker.setMap(map);
        markers.push(marker);
    }
}

function clearMarkers() {
    for (marker of markers) {
        marker.setMap(null);
    }
    markers = [];
}

function details(institution) {
    clearPopups();
    var info = document.createElement('div');
    var institutionContainer = document.createElement('div');
    institutionContainer.className = 'institution-container';
    var institutionName = document.createElement('h3'),
        institutionLogo = document.createElement('img');
    institutionName.textContent = institution.name;
    institutionLogo.src = institution.logo || '';
    institutionLogo.alt = institution.name + ' Logo';
    institutionContainer.appendChild(institutionName);
    institutionContainer.appendChild(institutionLogo);
    info.appendChild(institutionContainer);
    for (student of institution.students) {
        var studentPhoto = document.createElement('img'),
            studentName = document.createElement('p'),
            studentMajor = document.createElement('p');
        studentPhoto.src = 'portraits/' + currentYear + '/' + student.name + '.jpg';
        studentPhoto.alt = student.name + ' portrait';
        studentPhoto.draggable = false;
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
    console.log('Adding popup');
    popupOpen = true;
}

var dragged = false;
onmousedown = function() {
    dragged = false;
}
onmousemove = function() {
    dragged = true;
}

onmouseup = function(e) {
    // Check that we're not clicking a marker and that there was no dragging
    if (e.target.tagName != 'AREA'
        && dragged == false) {
        clearPopups();
    }
    dragged = false;
}

onkeydown = function(e) {
    if (e.key === 'Escape') {
        clearPopups();
    }
}

yearSelect.addEventListener('change', (event) => {
    if (currentYear != event.target.value) {
        currentYear = event.target.value;
        refreshMap(currentYear);
    }
});

function transitionEnd(element, transitionProperty) {
    return new Promise(function(resolve, _) {
        var callback = function(event) {
            if (event.propertyName === transitionProperty) {
                element.removeEventListener('transitionend', callback);
                resolve();
            }
        };
        element.addEventListener('transitionend', callback);
    });
}

function sleep(millis) {
    return new Promise((resolve, _) => setTimeout(resolve, millis));
}

function debugInstitutionLogos() {
    for (name in downloadedYears[currentYear]) {
        if (!downloadedYears[currentYear][name].logo) {
            console.warn('No logo found for Institution: ' + name);
        }
    }
}

function debugPortraits() {
    for (name in downloadedYears[currentYear]) {
        for (student of downloadedYears[currentYear][name].students) {
            fetch('/portraits/' + currentYear + '/' + encodeURI(student.name) + '.jpg')
                .catch(() => console.err('Portrait not found for Student: ' + student.name));
        }
    }
}

