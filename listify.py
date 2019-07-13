import csv
with open('universities.csv') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row[1])
