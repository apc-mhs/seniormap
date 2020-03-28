import geocoder

while True:
    try:
        locations = input('> ')
        for location in locations.split(','):
            g = geocoder.osm(location)
            lat, lng = tuple(g.latlng)
            print(f'{location},{lat},{lng}')
    except EOFError:
        break
