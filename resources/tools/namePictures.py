import os 

# This is a script to automatically name photographs of students
# Typically photos are given to the APC with names of 00001, 00002, etc
# These photos are alphabetically ordered, but with unhelpful names (e.g. 00001)
# To name the photos with this script, download all of the photos into a folder.
# Fill this scirpts names array with the names in alphabetical order 
# (student name list is available from the registrar of GMHS) 
# Place this script in folder with the unnamed photos\
# Run the script

def main(): 
    names = [['firstname', 'lastname']]
    
    files = os.listdir(".")
    files.sort()

    for count, filename in enumerate(files): 
        dst = names[count][0] + " " + names[count][1] + ".jpg"
        src = filename 
        os.rename(src, dst) 

if __name__ == '__main__': 
    main()

