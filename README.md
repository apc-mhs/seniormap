# seniormap
An interactive map of GMHS seniors' college/postsecondary destinations.  Created by Erik Boesen (GMHS Class of 2019), the map is now maintained by the GMHS Advanced Programming club. If you'd like to make a submission to the map please navigate to https://apc-gm.com/seniormap/ and click on the form in the bottom right corner. 

## Maintainence instructions 
### Creating a the form and spreadsheet for a new year

1. Navigate to the 'Senior Map' folder on Google Drive and create a new folder with the year of the graduating class (e.g. 2027)
2. Make a copy of a previous year's form and edit content accordingly for the appropriate year
3. Ensure the form has a [linked Google spreadsheet](https://drive.google.com/file/d/1aFtfqwHGrV9CzMXrnqTfLghL3VVLddmU/view?usp=sharing) with appropriate fields
4. Publish the spreadsheet to the web (File > Publish to the web; link will then be provided) 

### Adding the new year to the code base

1. Within `js/scripts.js`, find the `var dataDocuments` and add an entry, with the spreadsheet's datasheet URL for the appropriate year.
   - For example: `['2027', 'a8a8a8a8a8a8a8a8a8a8a8a8a8a'],`
2. Within `index.html` update the linked form link to the latest year.
   - For example: `<p><a href="https://forms.gle/form">Submit your destination here</a></p>`
3. Create an entry mimcking the existing entry cells for the spreadsheet's datasheet URL in the Google Drive's 'Year Data' folder (Senior Map/Shared Data/Year Data).

### Obtaining and readying senior portraits of students

1. Email the registrar for a list of students. He/she for them will provide them to you in spreadsheet form
2. Email the yearbook club teacher lead and ask for senior portraits for the senior map. He/she will share a folder with you on Google Drive
   - These images will be in alphabetical order with file names of 00001.jpeg, 00002.jpeg, etc. 
3. Download the photo into a folder on your desktop
4. Download the photo naming script available at `resources/tools/namePictures.py`
5. Convert the spreadsheet of names into a 2D array to replace `[['firstname', 'lastname']]`
6. Run the Python script, renaming all of the unnamed photos to their corresponding student names. Ensure the lack of discrepancies
7. Create a new folder inside of `portraits` named with the corresponding year
8. Upload the pictures to that folder 

### Adding a new student to the map after form submission 

1. After a student submits the form, a new entry will appear in the the corresponding spreadsheet
2. If the student appears on the map, highlight the entry in green to indicate they're visible.
3. If the student does not appear on the map, the college they are attending must be added 
   - To do this, create a new entry in 'Shared Data' (Senior Map/Shared Data/Location Information) for both the coordinates and logos subsheets
   - Mimicking existing cells, add the [coordinates](https://drive.google.com/file/d/15ZCgHHTP8P6jj70dlEXL2-70sMu3ShFr/view?usp=sharing), and the [logo](https://drive.google.com/file/d/11dSQjoj8avHsgOBzhuNIWkc6HyuRigzV/view?usp=sharing) to the entries
   - A good way to see if certain schools aren't appearing is using the developer console. Instituions that do not appear [will appear](https://drive.google.com/file/d/1nywa-nbBHmfXQ1SLgvYWYVisaxmH_aMo/view?usp=sharing)
4. After ensuring the student appears, mark them visible! 

---

If you have any questions about the codebase/maintaining it, or adding a new class to the page, don't hesistate to reach out to past maintainers. Also make sure you publicize the map to your class to carry on the tradition! Talk to your class officers about posting the map, and reach out to the college counselor. 
