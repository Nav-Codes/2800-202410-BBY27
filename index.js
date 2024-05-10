//express constants
require("./utils.js");

//express constants
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
app.use(favicon(path.join(__dirname,'public','favicon.ico')));
const session = require('express-session');
const fs = require('fs');
app.use(express.urlencoded({extended: false}));

// Serve static files from the dist/exercises directory
app.use('/exercises', express.static(path.join('exercises')));

app.set('view engine', 'ejs');

//port
const port = process.env.PORT || 3000;

require('dotenv').config();

//main mongo connector
const MongoStore = require('connect-mongo');
const saltRounds = 12;

const expireTime = 3600;

//openai
const openai_api_key = process.env.OPENAI_API_KEY; 
const { OpenAI } = require('openai');
const openai = new OpenAI(openai_api_key);

const readline = require('readline');
const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//crypt const
const bcrypt = require('bcrypt');

const Joi = require("joi");

var {database} = include('databaseConnection.js');
const userCollection = database.db(process.env.MONGODB_DATABASE).collection(process.env.MONGODB_COLLECTION);


/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

app.get('/filtering/:filter', (req,res) => {
    res.redirect('/exercises/?filter=' + req.params.filter);
});

app.get('/createUser', (req,res) => {
    res.render("signUpForm", {duplicate: 0, InvalidField: 0});
});


app.post('/submitUser', async (req,res) => {
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;

	const schema = Joi.object(
		{
			name: Joi.string().max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().max(20).required()
		});
	
	const validationResult = schema.validate({email, password, name});
	if (validationResult.error != null) {
	   console.log(validationResult.error);
	   res.render("signUpForm",{duplicate: 0, InvalidField: 1})
	   return;
   }

    var hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await userCollection.find({email: email}).project({email: 1, password: 1, name: 1, _id: 1}).toArray();

    if (!result || result.length === 0) {
        // No user found with the given email
        await userCollection.insertOne({ email: email, password: hashedPassword, name: name });
        console.log("Inserted user");
    
        // Set user details in the session
        req.session.authenticated = true;
        req.session.email = email;
        req.session.name = name;
        req.session.cookie.maxAge = expireTime;
    
        //temp redirect till homepage complete.
        res.redirect("/");
    } else {
        // Check for duplicate email or name
        const existingUser = result.find(user => user.email === email || user.name === name);
        if (existingUser) {
            res.render("signUpForm", { duplicate: 1, InvalidField: 0 });
        } else {
            // No duplicate found, insert new user
            await userCollection.insertOne({ email: email, password: hashedPassword, name: name });
            console.log("Inserted user");
    
            // Set user details in the session
            req.session.authenticated = true;
            req.session.email = email;
            req.session.name = name;
            req.session.cookie.maxAge = expireTime;
    
            //temp redirect till homepage complete.
            res.redirect("/");
        }}
});


app.get('/login', (req,res) => {
    res.render("loginForm", { error: { userNoExist: 0, EmailNotEnt: 0, Wrong: 0 }});
});

app.post('/loggingin', async (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

	const schema = Joi.string().email().required();
	const validationResult = schema.validate(email);
    


	if (validationResult.error != null) {
        res.render("loginForm", { error: { userNoExist: 0, EmailNotEnt: 1, Wrong: 0 } });

        return;
	}



	const result = await userCollection.find({email: email}).project({email: 1, password: 1, name: 1, _id: 1}).toArray();

	console.log(result);
	if (result.length != 1) {
        res.render("loginForm", { error: { userNoExist: 1, EmailNotEnt: 0, Wrong: 0 } });
		return;
	}

    
    const user = result[0];

	if (await bcrypt.compare(password, result[0].password)) {
		console.log("correct password");
		req.session.authenticated = true;
		req.session.email = user.email;
        req.session.name = user.name;
		req.session.cookie.maxAge = expireTime;

       
		res.redirect('/loggedIn');
		return;
	}
	else {
        res.render("loginForm", { error: { userNoExist: 0, EmailNotEnt: 0, Wrong: 1 } });
	}
});

app.get('/loggedin', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    try {
        const email = req.session.email;

        // Fetch the user's name from the database based on their email
        const user = await userCollection.findOne({ email: email }, { projection: { name: 1 } });

        if (user) {
            // If user found, display the logged-in message along with the user's name
            req.session.name = user.name;
            
            //temp redirect till homepage complete.
            res.redirect("/")
        } else {
            // If user not found, log out the user
            req.session.destroy();
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', (req, res) => {
    res.render('userProfile');
});

app.get('/editProfile', (req, res) => {
    res.render('editProfile');
});

const workouts = {
    work : [
        {
            date: 'sunday',
            workoutList: ['rest']
        },
        {
            date: 'monday',
            workoutList: ['push-ups', 'pull-ups', 'bicep curls']
        },
        {
            date: 'tuesday',
            workoutList: ['lunges', 'squats']
        },
        {
            date: 'wednesday',
            workoutList: ['rest']
        },
        {
            date: 'thursday',
            workoutList: ['lat pull down', 'bench press']
        },
        {
            date: 'friday',
            workoutList: ['tricep extensions', 'push ups']
        },
        {
            date: 'saturday',
            workoutList: ['active rest']
        },
    ]
};

app.get('/schedule', (req, res) => {
    res.render('schedule', {workouts});
});

app.get('/goals', (req, res) => {
    res.render('goals');
});

app.get('/exercise/:id', (req, res) => {
    try {
        // Read the JSON file
        fs.readFile("./dist/exercises.json", 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Parse the JSON data
            const jsonData = JSON.parse(data);

            const filteredExercises = jsonData.filter(item => item.id === req.params.id);

            // Send the list of exercises as response
            res.render('exercise', {filteredExercises});
        });
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/exercises', (req, res) => {
    try {
        // Read the JSON file
        fs.readFile("./dist/exercises.json", 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            let searchParam = "";

            // Parse the JSON data
            let jsonData = JSON.parse(data);
            if (req.query.search != null){
                jsonData = jsonData.filter(item => item.name.toLowerCase().includes(req.query.search));
                searchParam = req.query.search;
            }

            let filter = req.query.filter || "";
            if (filter){
                jsonData = jsonData.filter(item => item.level == req.query.filter);
            }

            // Calculate pagination parameters
            const pageSize = 10; // Number of exercises per page
            const totalPages = Math.ceil(jsonData.length / pageSize);
            let currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified
            currentPage = Math.min(Math.max(currentPage, 1), totalPages); // Ensure current page is within valid range

            // Calculate the start and end indices of exercises for the current page
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, jsonData.length);

            // Extract names, images, and descriptions from the JSON data for the current page
            const exercisesInfo = jsonData.slice(startIndex, endIndex);

            // Send the list of exercises for the current page as response
            res.render('exerciselist', {searchParam, exercisesInfo, currentPage, filter, totalPages});
        });
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/search', async (req, res) => {
    let search = req.body.search;
    let filter = req.body.filter || "";
    res.redirect("/exercises/?filter=" + filter + "&search=" + search);
});

app.get('/ai', async (req,res) =>{
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{"role":"user", "content":"Give me a poem?"}],
        max_tokens: 60
    })
    res.json({ message: response['choices'][0]['message']['content'].trim() });
});

// app.get('/aiTalk', async (req,res) =>{
//     res.send(`
//     <input type="text" id="userInput">
//     <button onclick="send()">Send</button>
//     `);
//     userInterface.prompt()
//     userInterface.on('line', async (line) => {
//         const response = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo',
//             messages: [{"role":"user", "content":line}],
//             max_tokens: 60
//         })
//         console.log(response['choices'][0]['message']['content'].trim());
//         userInterface.prompt();
//     });
// });

app.get('/aiTalk', (req, res) => {
    res.send(`
        <input type="text" id="userInput"> 
        <button onclick="send()">Send</button> 
        <script>
            function send() {
                const userInput = document.getElementById('userInput').value;
                fetch('/aiTalk', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ line: userInput }),
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                });
            }
        </script>
    `);
});

app.post('/aiTalk', async (req, res) => {
    const line = req.body.line; // extracts the 'line' property from the request body
    const response = await openai.chat.completions.create({ // sends request to OpenAI API to generate a response
        model: 'gpt-3.5-turbo', 
        messages: [{"role":"user", "content":line}], 
        max_tokens: 60 
    })
    res.send(response['choices'][0]['message']['content'].trim()); 
});

app.get('/', (req, res) => {
    res.render('home');
});
 
app.get("*", (req, res) => {
    console.log("404");
    res.status(404);
    res.send("Page not found - 404");
});


app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
