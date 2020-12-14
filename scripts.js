var map, popup, Popup, markers = [];
var mapElement = document.getElementById('map');
var yearSelect = document.getElementById('year-select');
var panCheckbox = document.getElementById('pan-option');
var precedenceSelect = document.getElementById('cover-select');

var today = new Date();
// The yearActivationMonth determines the month that a specific year is added to
// the yearSelect dropdown. The value "4" means that a year will become available
// in May
var yearActivationMonth = 4;
var currentYear = new Date(
    today.getFullYear(),
    today.getMonth() - yearActivationMonth,
    today.getDate()
).getFullYear().toString();
// Using a default select option prevents a jump in the width of the select element
var defaultSelectOption = document.createElement('option');
defaultSelectOption.textContent = currentYear;
yearSelect.appendChild(defaultSelectOption);

var panToMarkers = true;
var popupOpen = false;

var institutionDataSheet = '1qEcBuuRtQT-hE_JyX6SlMxTodvXCtAXX1LSB4ABBlXU';
var dataDocumentsSheet = '1VZmrdC-rm6noqxMoFWiPimOiM3-zmhk5kOmJ8RppU9w';
var dataDocuments = new Map();

var logos = new Map();
var coordinates = {};
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
        styles: mapStyles
    });

    Promise.all([
        fetchDataDocuments(),
        fetchInstitutionData()
    ]).then(() => displayMap(currentYear));
}

function fetchDataDocuments() {
    return fetchTabletopData(dataDocumentsSheet, function(tabletop) {
        // Clear defaultSelectOption
        yearSelect.innerHTML = '';
        for (let dataDocument of tabletop.sheets('main').all()) {
            dataDocuments.set(dataDocument['Year'], dataDocument['Datasheet URL']);

            let option = document.createElement('option');
            option.textContent = dataDocument['Year'];
            if (dataDocument['Year'] == currentYear) {
                option.selected = true;
            }

            yearSelect.prepend(option);
        }
    });
}

function fetchInstitutionData() {
    return fetchTabletopData(institutionDataSheet, function(tabletop) {
        // Turn 2D list into easily-subscriptable object
        for (let institution of tabletop.sheets('coordinates').all()) {
            coordinates[institution['Name']] = {
                lat: parseFloat(institution['lat']),
                lng: parseFloat(institution['lng']),
            };
        }

        for (let logo of tabletop.sheets('logos').all()) {
            logos.set(logo['Name'], logo['Logo']);
        }
    });
}

function fetchStudentData(year) {
    if (downloadedYears[year] !== undefined) {
        clearMarkers();
        return Promise.resolve();
    }

    return fetchTabletopData(dataDocuments.get(year), function(tabletop) {
        clearMarkers();
        var savedData = buildMarkers(tabletop)
        // Save the data in an object for caching purposes
        downloadedYears[year] = savedData;
    });
}

function fetchTabletopData(sheetID, callback) {
    var fetchFunction = function fetchData(resolve, reject) {
        Tabletop.init({
            key: sheetID,
            error: reject,
            callback: function(data, tabletop) {
                callback(tabletop);
                resolve();
            },
            simpleSheet: true
        });
    }

    return new Promise(fetchFunction);
}

function displayMap(year) {
    mapElement.classList.add('loading');
    clearPopups();
    Promise.all([
        // Minimum delay of 300ms before, then, placing new markers
        Promise.all([
            fetchStudentData(year),
            sleep(300)
        ]).then(() => placeMarkers(downloadedYears[year])),
        // Either the transition ends or its time is up
        Promise.race([
            transitionEnd(mapElement, 'filter'),
            sleep(750)
        ])
    ]).then(function() {
        mapElement.classList.remove('loading');
    });
}

function clearPopups() {
    if (popup) popup.setMap(null);
}

function buildMarkers(tabletop) {
    var institutions = {};
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

    for (institution of logos.keys()) {
        if (institutions[institution]) {
            institutions[institution].logo = logos.get(institution);
        }
    }

    console.log(institutions);
    return institutions;
}

function placeMarkers(institutions) {
    for (name in institutions) {
        //console.log('Creating marker for ' + name + ' with ' + institutions[name].students.length + ' student(s).');
        let marker = new google.maps.Marker(institutions[name]);
        google.maps.event.addListener(marker, 'click', function() {
            details(this);

            if (panToMarkers) {
                var scale = 1 / (1 << map.getZoom());
                var worldCoordinate = map.getProjection().fromLatLngToPoint(marker.position);
                var defaultOffset = 80 * scale;
                var offsetPerStudent = 40 * scale;
                
                worldCoordinate.y -= defaultOffset + 
                    (offsetPerStudent * Math.min(5, this.students.length));
                worldCoordinate.y = Math.max(0, worldCoordinate.y);

                var latLng = map.getProjection().fromPointToLatLng(worldCoordinate);
                map.panTo(latLng);
            }
        });
        marker.setMap(map);
        markers.push(marker);
    }
    setMarkerPrecedence(precedenceSelect.value == 'Bottom');
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
    var studentsList = document.createElement('div');
    studentsList.className = 'students-list';
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
        studentsList.appendChild(studentContainer);
    }
    info.appendChild(studentsList);
    info.style.setProperty('--num-columns', Math.ceil(studentsList.children.length / 5));
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

yearSelect.addEventListener('change', function (event) {
    if (currentYear != event.target.value) {
        currentYear = event.target.value;
        displayMap(currentYear);
    }
});

panCheckbox.addEventListener('click', function (event) {
    panToMarkers = event.target.checked;
});

precedenceSelect.addEventListener('change', (event) => {
    setMarkerPrecedence(event.target.value == 'Bottom');
});

function setMarkerPrecedence(bottom) {
    let bottomMultiplier = bottom ? -1 : 1;

    let sortFunction = function(a, b) {
        let aPos = a.position || {lat: () => 0};
        let bPos = b.position || {lat: () => 0};

        return bottomMultiplier * (aPos.lat() - bPos.lat());
    };
    markers.sort(sortFunction);

    for (var i = 0; i < markers.length; i++) {
        markers[i].setZIndex(i);
    }
}

function clamp(value, max, min) {
    return Math.min(max, Math.max(value, min));
}

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
            fetch('portraits/' + currentYear + '/' + encodeURI(student.name) + '.jpg')
                .catch(() => console.err('Portrait not found for Student: ' + student.name));
        }
    }
}

var mapStyles = [
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
];