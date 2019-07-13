import wikipedia
with open("universities.txt", "r") as f:
    universities = f.readlines()

def get_image(options):
    if not options:
        return ""
    for image in options:
        if image.endswith(".svg"):
            return image
    return options[0]

with open("universities.csv", "w") as f:
    with open("universities.html", "w") as preview:
        f.write("name,image\n")
        for university in universities:
            university = university.strip()
            print("Processing " + university)
            try:
                page = wikipedia.page(university)
                image = get_image(page.images)
            except KeyError:
                image = ""
            f.write(university + "," + image + "\n")
            preview.write(f'<p>{university}<img src="{image}"></p>')
