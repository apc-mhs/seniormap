import geocoder

while True:
    try:
        location = input('> ')
        g = geocoder.osm(location)
        lat, lng = tuple(g.latlng)
        print(lat)
        print(lng)
    except EOFError:
        break
