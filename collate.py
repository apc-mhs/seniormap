import wikipedia
with open("universities.txt", "r") as f:
    universities = f.readlines()

blacklist = (
    "Flag_of",
    "Text_document_with_red_question_mark",
    "_Map_",
    "Graduation_hat",
    "Question_book",
    "Andorra_Telecom_2019_logo",
)

def get_image(options):
    options = [option for option in options if not any(x in image for x in blacklist)]
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
                print(page.title)
                image = get_image(page.images)
            except KeyError:
                image = ""
            f.write(university + "," + image + "\n")
            preview.write(f'<p>{university}<img src="{image}"></p>')
