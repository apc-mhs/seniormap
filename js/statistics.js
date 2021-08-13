var statistics = {
    container: document.getElementById('statistics'),
    button: document.getElementById('statistics-button'),
    header: document.getElementById('statistics-header'),
    class: document.getElementById('statistics-header-class'),
    stats: {
        students: document.getElementById('stats-students'),
        destinations: document.getElementById('stats-destinations'),
        states: document.getElementById('stats-states'),
        countries: document.getElementById('stats-countries')
    }
}

statistics.button.addEventListener('click', function() {
    statistics.container.classList.toggle('open');
});

function loadStatistics(year, stats) {
    statistics.container.classList.remove('no-data');
    statistics.class.textContent = year;
    statistics.stats.students.textContent = students.get(year).length;

    if (!stats.get(parseInt(year))['Number of destinations']) {
        statistics.container.classList.add('no-data');
    }

    statistics.stats.destinations.textContent = stats.get(parseInt(year))['Number of destinations'];
    statistics.stats.states.textContent = stats.get(parseInt(year))['Number of states'];
    statistics.stats.countries.textContent = stats.get(parseInt(year))['Number of countries'];
}

function hideStatisticsPanel() {
    statistics.container.classList.remove('open');
}