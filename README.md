# This is my final project for CS50 Programming with Python and JavaScript cource

## Medicard.global
Medicard is platform for save you healhchek results in one place.

**What i do on this time.**
Use 2 databases: 
PostgreeSQL for users information
Google Firebase for storage images and documents
  
**Why I think my project satisfies the distinctiveness and complexity requirements, mentioned above?**
Well, i learn how to work with HTML/CSS, Django , Vanilla JS, REST Api, Firebase Storage and Firebase Firestore, library for OCR text, Deploy app to heroku and many intresting thinks like make input validators,  setup CORS and more...  

**What contans files I create?**
All folders tree is standart for django project. I modify standart files and setting and also add:
medicard/portal/static/portal/css:
 - admin.css - styles for admin panel
 - login.css - styles for login/refister page
 - styles.css - all stiles for portal and index page
 img - folder for static images
 js - folder with javaScript files
 - admin.js - instructions for admin page
 - app.js - main 
 - passport.js - scripts for load and insert inforpation to covid 19 passport page
 - validator.js - scripts for validate forms and upload file sizes
 manifest.json - file for make PWA
 medicard/portal/templates/portal/admin - html files for admin page
 medicard/portal/templates/portal/reset - html files for reset user password 
 medicard/portal/templates/portal/serwisworkers - js file for make PWA( Currently unused)
 medicard/portal/templates/portal/ *.html files - templates portal and index pages, portal pages, login page and index website page
 
 Basedir .db.sqlite - Database
 Procfile - files show how to start webserver 
 Requirements - installed modules list
 Readme - Your read it now 

 

**How to open?** It already deployed to heroku, you can look on it at link [Link To Medicard heroku ](https://radiant-depths-71714.herokuapp.com/)
*All requirements based at requirements.txt file.* 

**How it works and what functionality have for this moment:**
**Index page** - Just simple website for introduce project
**Login** - User login page. If user not yet register he can register from login page or recover his pasword (Get recover link to email)
**Medicard Portal** - After success login user can go to portal and see pages:

 - **Home (Dashboard page)** - Have main iformation about futures and user changes log
 
 
 ![enter image description here](https://i.ibb.co/9WVvZqQ/dash.jpg)
 - **Covid-19 Passport:** Online vaccination passport from Coviid-19. User can upload existing vaccination document. (Recoginze future not yet in my level so i not yet make it) . I have helper js script to enter id  and user info and upload it to passport information.


 ![enter image description here](https://i.ibb.co/P95FQK6/cvid.jpg)
 - **My Family.** -Page where user can add his family members and then look their profiles and medical information( If family member give access on his profile page)
 
 
 ![enter image description here](https://i.ibb.co/58RrGyc/family.jpg)
 - **Recognizer** - You can upload any photo of healtcheck documents to your page. Then documents get status upload - true, recognized - false , rejected - false. You can see your uploaded documents on recognizer page :


![enter image description here](https://i.ibb.co/41FQ3Ms/reco.jpg)
- *I not make automatic recognizer but i do admin panel. User is admin  he can come to Admin page and see all uploaded documents of user. He can click of document, it loaded to one colums and second column have manual input fields for document parametrs. As helper behind of loaded picture you can press "Start OCR Tool" button and is start OCR  recognizer and then show for you recognize text. Then can copy this text to new document fields and save.If automatily saved for user who upload this picture.* 
	 
	 
![enter image description here](https://i.ibb.co/0jw93st/admin.jpg%22%20alt=%22admin%22%20border=%220%22%3E%3C/a%3E)
	 
- After you save resut, this result user can see on his **Medical Card** page and at recognizer page this document will be marked as recognized.

**Medical Card** - Here you can search all your saved documents. 
*Also can add by hand new document with paramentra or add document with pictures.*


![enter image description here](https://i.ibb.co/HPXXDPg/medicard.jpg)

**User Profile:** Page with information about user, can upload avatar, add contact phone numbers, add your allergens and add users to access list for accept them see your page and medical records. 



![enter image description here](https://i.ibb.co/9htJ9R8/profile.jpg)


And yes, i not hide any apy keys and secret keys
