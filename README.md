# 2800project

# Project Description
WeFit aims to make improving your health easier than ever by using user-centred design and the power of AI.

# Technologies
Front-end:
- EJS
- CSS
- Bootstrap
- JavaScript
- jQuery

Back-end:
- Javascript
- JSON

Database: 
- MongoDB

API's: 
- ChatGPT 3.5 turbo: https://platform.openai.com/docs/models/gpt-3-5-turbo
- WGER fitness API: https://wger.de/en/software/api 

Node modules and other technologies: 
- axios -version 1.6.8
- bcrypt version 5.1.0
- bootstrap version 4.0.0
- connect-mongo --version 4.6.0
- crypto version 1.0.1
- dotenv version 16.0.3
- ejs version 3.1.10
- express --version 4.19.2
- express-session version 1.17.3
- joi version 17.8.4
- multer version 1.4.5-lts.1
- nodemailer --verion 6.9.13
- nodemailer-smtp-transport --version 2.7.4
- openai version 4.43.0
- readline -version 1.3.0
- serve-favicon --version 2.5.0

# Files
1.  dist
    1.  exercises.json
2. exercises
3. node_modules
4. public
    1. css
        1. editProfile.css 
        2. homeAuthenticated.css
        3. loginForm.css
        4. signupForm.css
    2. js
        1. accountRetrieval.js
        2. ai.js
        3. editProfile.js 
        4. goalsHome.js
        5. schedule.js
    3. favicon.ico
    4. WeFitLogo.png
5. views
    1. templates
        1. footer.ejs
        2. header.ejs
        3. modalEditor.ejs
        4. navbar.ejs
    2. 404.ejs 
    3. ai.ejs
    4. editProfile.ejs
    5. exercise.ejs
    6. exerciselist.ejs 
    7. goals.ejs 
    8. homeAuthenticated.ejs 
    9. homeUnauthenticated.ejs 
    10. loginForm.ejs 
    11. passwordReset.ejs
    12. schedule.ejs 
    13. scheduleEditor.ejs 
    14. signUpForm.ejs 
    15. userProfile.ejs   
6. .env
7. .gitignore
8. databaseConnection.js
9. index.js
10. package-lock.json
11. package.json
12. README.md
13. utils.js

# Installation
1. Fork the repo from GitHub
2. Clone the forked repo onto your local machine using the command line
3. Ensure that npm is installed on your machine
4. On the command line, go to the directory where the repo is and run "npm i" to install all the node packages mentioned in the Technologies section
5. Create a .env file that contains the following: 
    MONGODB_HOST=YourMongoDBHostname
    MONGODB_USER=YourMongoDBUsername
    MONGODB_PASSWORD=YouMongoDBPassword
    MONGODB_DATABASE=YourMongoDBProject
    MONGODB_COLLECTION=users
    MONGODB_COLLECTION_SCHEDULE=schedules
    MONGODB_SESSION_SECRET=YourOwnMongoDBSessionSecret
    NODE_SESSION_SECRET=YourOwnNodeSessionSecret
    OPENAI_API_KEY=YourOwnAPIKey
    PORT=#
   - To create a session secret/GIUD/UUID for the MongoDB and Node session secrets, visit one of these websites:
    - https://guidgenerator.com/ 
    - https://www.uuidgenerator.net/guid 
    - https://www.guidgen.com/

6. Go to the directory where the repo is and run "node index.js" to run the web app on local host

Testing spreadsheet: https://docs.google.com/spreadsheets/d/1ykLde51TMumc67eQ14dgS-14nVI9ENbN393CRtv6Ndo/edit#gid=0

# Features
- Scheduler that allows you to add or remove workouts from specific days in your schedule
- AI assisntant to help recommend workouts and give you tips
- Goal setter and tracker that allows you to set goals for yourself and track your goals
- Workout explorer that allows you to search workouts by workout name and filter workouts by difficulty

# AI
- a. We used AI to help develop parts of the web app. We would explain to ChatGPT about a specific issue we were running into like a bug and ask it to recommend a fix for it. We would also ask it to develop ways to implement a certain part of a feature like how check off workouts that are already in your workout list using ejs. It would mainly be a way to get unstuck from a problem that we could not figure out. 
- b.  We did not use ChatGPT to create or clean data sets. 
- c. Our app uses the ChatGPT 3.5 turbo API. There is essentially a five step process that goes into the functionality of the AI: 
    1. We take the user input and send it over to the server as JSON data.
    2. The server sends the input to the ChatGPT API and wait for its response.
    3. Once the server has got the response from ChatGPT, it would clean it and send it back to the client.
    4. The client side code would then parse the response and store it in a variable. 
    5. The variable is then displayed and formatted onto the web app for the user to see. 
- d. One limitation that we came across was the effectiveness of ChatGPT when trying to seek help from it. Since there are a lot of moving parts to our project, we have to explain thoroughly what the current situation is, the expected result we want, and what the code is currently giving us. It would often take some time to generate a response that actually worked. Sometimes, we would just abandon ChatGPT and try to figure it out ourselves becuase ChatGPT would keep giving us bad responses. One example is the processing of which workouts are going in and out of a users schedule. It took hours to try and get ChatGPT to get something to work, but every iteration had a bug in it. Eventually, the team member gave up and decided to implement the solution on their own, which ended up working just fine.  

# Credits
- ChatGPT: https://chatgpt.com/?oai-dm=1
- https://www.w3schools.com/jsref/jsref_getday.asp
- https://www.geeksforgeeks.org/how-to-iterate-over-a-javascript-object/
- https://www.mongodb.com/docs/manual/reference/operator/update/pull/
- https://www.akto.io/academy/get-vs-post
- https://platform.openai.com/docs/models/gpt-3-5-turbo
- https://www.youtube.com/watch?v=Ll5f0jGIqa4


# Contact
- Matt: matthew_dodd_94@hotmail.com
- Dan: didacdan@gmail.com
- Alenn: gauttieralenndupaya@gmail.com
- Bryan: ble16@my.bcit.ca
- Navjot: navjotkehal5@gmail.com