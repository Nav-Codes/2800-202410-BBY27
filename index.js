//express constants
require("./utils.js");

//express constants
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const { createHmac } = require('node:crypto');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(favicon(path.join(__dirname,'public','favicon.ico')));

const session = require('express-session');
const fs = require('fs');
const fspromise = require('fs').promises;
app.use(express.urlencoded({extended: false}));

// Serve static files from the dist/exercises directory
app.use('/exercises', express.static(path.join('exercises')));
app.use(express.static(__dirname));
app.use('/login', express.static(path.join(__dirname, '/public/js')));


app.set('view engine', 'ejs');

//port
const port = process.env.PORT || 3000;

require('dotenv').config();

//main mongo connector
const MongoStore = require('connect-mongo');
const saltRounds = 12;

//session expire time an hour
const expireTime = 3600 * 1000;

//openai
const openai_api_key = process.env.OPENAI_API_KEY; 
const { OpenAI } = require('openai');
const openai = new OpenAI(openai_api_key);

const bodyParser = require('body-parser');
app.use(bodyParser.json());

//crypt const
const bcrypt = require('bcrypt');

const Joi = require("joi");

//collections in database
var {database} = include('databaseConnection.js');
const userCollection = database.db(process.env.MONGODB_DATABASE).collection(process.env.MONGODB_COLLECTION);
const scheduleCollection = database.db(process.env.MONGODB_DATABASE).collection(process.env.MONGODB_COLLECTION_SCHEDULE);

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
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

//Middleware to check if user is authenticated
app.use(function(req, res, next) {
    res.locals.authenticated = req.session.authenticated || false;
    next();
});

app.get('/filtering/:filter', (req,res) => {
    res.redirect('/exercises/?filter=' + req.params.filter);
});

app.get('/createUser', (req,res) => {
    res.render("signUpForm", {duplicate: 0, InvalidField: 0});
});

//creates a sample schedule with default workout
function createSchedule(email) {
    scheduleCollection.insertOne({
        email : email, 
        Sunday : ['No workouts'],
        Monday : ['No workouts'],
        Tuesday : ['No workouts'],
        Wednesday : ['No workouts'],
        Thursday : ['No workouts'],
        Friday : ['No workouts'],
        Saturday : ['No workouts'],
    });
    console.log('created empty schedule');
}

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

        //create sample workout schedule that contain empty for each day of the week
        createSchedule(email);
    
        //temp redirect till homepage complete.
        res.redirect("/profile");
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

            //create sample workout schedule that contain empty for each day of the week
            createSchedule(email);
    
            //temp redirect till homepage complete.
            res.redirect("/profile");
        }}
});

app.get('/resetpassword/:token', async (req, res) =>{
    token = req.params.token;
    if (!await userCollection.findOne({resetToken: token})){
        res.redirect('/login');
        return;
    }
    res.render('passwordReset', {token});
});

app.post('/forgotpassword', async (req, res) => {
    let email = req.body.email
    const result = await userCollection.find({email: email}).project({email: 1, password: 1, name: 1, _id: 1}).toArray();

	if (result.length != 1) {
        console.log("Email doesn't exist");
        res.json({status:"error", message:"Thank you for submitting your request. If a valid email was used, an email will be sent to that account. Please check your inbox for further information."});
		return;
	}

    const secret = 'abcdefg';
        const hash = createHmac('sha256', secret)
               .update('I love cupcakes')
               .digest('hex');
        await userCollection.updateOne({email: email}, {$set:{resetToken: hash}});

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'wefitpass@gmail.com',
          pass: 'ghcjcvmhksrcxpqp '
        }
      });
      const host = req.get('host');
      const resetLink = `http://${host}/resetpassword/${hash}`;
    try {
        await transporter.sendMail({
            from: 'wefitpass@gmail.com',
            to: email,
            subject: 'AccountInfo',
            text: `link: ${resetLink}`
            });

        res.json({status:"success", message:"Thank you for submitting your request. If a valid email was used, an email will be sent to that account. Please check your inbox for further information."});
    } catch (error) {
        // Handle errors that occur during email sending
        console.error('Error sending email:', error);
        // You can also send a response indicating that there was an error
        res.status(500).send('Error sending email');
    }
});

app.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    if (req.file) {
        const email = req.session.email;
        const profilePicture = req.file.buffer;

        try {
            // Update user document with profile picture
            await userCollection.updateOne(
                { email: email },
                { $set: { profilePicture: profilePicture } }
            );

            res.redirect('/profile');
        } catch (error) {
            console.error('Error updating profile picture:', error);
            res.status(500).send('Error updating profile picture');
        }
    } 
});

app.get('/profilePicture', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    try {
        const email = req.session.email;
        const user = await userCollection.findOne(
            { email: email },
            { projection: { profilePicture: 1 } }
        );

        if (user && user.profilePicture) {
            res.set('Content-Type', 'image/jpeg');
            res.send(user.profilePicture.buffer);
        } else {
            // Send a default placeholder image if no profile picture is found
            res.redirect('https://via.placeholder.com/300');
        }
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/editUser', async(req, res) => {
    let newUser = req.body.name;

    let user = req.session.email;

    await userCollection.updateOne({ email: user }, { $set: { name: newUser } });

    req.session.name = newUser;

    res.json({message: "Username Successfully Changed"});

})

app.post('/editPass', async(req, res) => {
    let curr = req.body.curr;
    let newPass = req.body.newPass;

    let user = req.session.email;

    const result = await userCollection.find({email: user}).project({email: 1, password: 1, name: 1, _id: 1}).toArray();

    if(await bcrypt.compare(curr, result[0].password)){

        let hashNew = await bcrypt.hash(newPass, saltRounds);

        await userCollection.updateOne({ email: user }, { $set: { password: hashNew } });

        res.json({message:"Password Successfully Changed!"});

    } else {
        res.json({message:"Invalid Current Password"});
    } 

})

app.get('/editProfile', async (req,res) => {
    res.render('editProfile');
})


app.post('/resetpassword/:token', async (req, res) => {
    let token = req.params.token;
    let newPassword = req.body.password;
    console.log(token);
    // Hash the new password
    let hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    try {
        // Find the user with the given reset token
        const user = await userCollection.findOne({ resetToken: token });
        if (!user) {
            // If no user is found with the given reset token, handle the error
            return res.status(400).send('Invalid reset token');
        }

        // Update the user's password with the new hashed password
        await userCollection.updateOne({ resetToken: token }, { $set: { password: hashedPassword } });

        // Unset the reset token from the user document
        await userCollection.updateOne({ resetToken: token }, { $unset: { resetToken: 1 } });

        // Redirect the user to the home page or any other desired page
        res.redirect('/');
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Error resetting password');
    }
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
            
            req.session.name = user.name;
            
            //temp redirect till homepage complete.
            res.redirect("/profile")
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
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
    res.render('userProfile', {username : req.session.name});
});

app.get('/editProfile', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
    res.render('editProfile');
});

app.get('/schedule', async (req, res) => {

    //gets workout schedule based on unique email
    const workouts = await scheduleCollection
    .find({email : req.session.email})
    .project({Sunday : 1, Monday : 1, Tuesday : 1, Wednesday : 1, Thursday : 1, Friday : 1, Saturday : 1})
    .toArray();

    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    } else {
        res.render('schedule', {workouts});
    }
});

app.get('/scheduleEditor/:day', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    //used to validate day passed into params
    var day = req.params.day;
    let gotActualDay = false;
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 0; i < daysOfWeek.length; i++) {
        if (daysOfWeek[i] == day) {
            gotActualDay = true;
            break;
        }
    }

    if (gotActualDay) {
        //gets the workout for the specified day
        const workouts = await scheduleCollection
            .find({ email: req.session.email })
            .project({ [day]: 1 })
            .toArray();

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
                
                //used to get full details of workouts currently in list
                let workoutData = jsonData;

                if (req.query.search != null) {
                    jsonData = jsonData.filter(item => item.name.toLowerCase().includes(req.query.search));
                    searchParam = req.query.search;
                }

                let filter = req.query.filter || "";
                if (filter) {
                    jsonData = jsonData.filter(item => item.level == req.query.filter);
                }

                //get all the info about the current days exercise; used for linking the exercise to its full page 
                let workoutIDs = [];
                for (let i = 0; i < workouts[0][day].length; i++) {
                    for (let j = 0; j < workoutData.length; j++) {
                        if (workouts[0][day][i] == workoutData[j].name) {
                            workoutIDs.push(workoutData[j]);
                            break;
                        }
                    }
                }

                // Calculate pagination parameters
                const pageSize = 20; // Number of exercises per page
                const totalPages = Math.ceil(jsonData.length / pageSize);
                let currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified
                currentPage = Math.min(Math.max(currentPage, 1), totalPages); // Ensure current page is within valid range

                // Calculate the start and end indices of exercises for the current page
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, jsonData.length);

                // Extract names, images, and descriptions from the JSON data for the current page
                const exercisesInfo = jsonData.slice(startIndex, endIndex);

                // Send the list of exercises for the current page as response
                res.render('scheduleEditor', { workouts, workoutIDs, searchParam, exercisesInfo, currentPage, filter, totalPages, day });
            });
        } catch (error) {
            // Handle error
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
});

app.post('/scheduleSearch/:day', async (req, res) => {
    //gets the string from the search bar and compares it with the titles of each exercise 
    let search = req.body.search;
    let day = req.params.day;
    res.redirect("/scheduleEditor/" + day + "?search=" + search);
});

//stores the name of the workout in the specified array in the schedules collection
app.post('/scheduleSave', async (req, res) => {    
    let workout = req.body.newWorkout;
    let day = req.body.day;

    let currentWorkouts = await scheduleCollection
            .find({ email: req.session.email })
            .project({ [day]: 1 })
            .toArray();
    
    //adding to database
    if (req.body.adding) { 
        
        //when adding to workout that is initially empty
        if (currentWorkouts[0][day][0] == "No workouts") { 
            await scheduleCollection.updateOne({email : req.session.email}, {$pull : {[day] : "No workouts"}})
        }
        await scheduleCollection.updateOne({email : req.session.email}, {$push : {[day] : workout}});
    } 
    
    //removing from database
    else { 
        await scheduleCollection.updateOne({email : req.session.email}, {$pull : {[day] : workout}});
        //check if removing workout makes array empty
        currentWorkouts = await scheduleCollection
            .find({ email: req.session.email })
            .project({ [day]: 1 })
            .toArray();
        if (currentWorkouts[0][day].length == 0) { 
            await scheduleCollection.updateOne({email : req.session.email}, {$push : {[day] : "No workouts"}});
        }
    }
    res.redirect('/scheduleEditor/' + day)
});

app.get('/goals', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }

    const result = await userCollection.findOne({ email: req.session.email });
    console.log(result);
    res.render('goals', { result });
});


app.post('/addgoal', async (req, res) => {
    let quantity = req.body.quantity;
    let unit = req.body.unit;
    let goal = req.body.goal;

    let goalArray = [];
    goalArray.push(quantity, unit, goal, 0);

    userCollection.updateOne({email: req.session.email}, {$push: {goal: goalArray}});
    res.redirect('/goals');
});

app.post('/deletegoal', async (req, res) => {
    const index = req.body.goalIndex; // Get the index from the request body
    try {
        // Use positional operator $ and $unset to remove the goal at the specified index
        await userCollection.updateOne(
            { email: req.session.email },
            { $unset: { [`goal.${index}`]: 1 } }
        );
        // Use $pull to remove null values left after using $unset
        await userCollection.updateOne(
            { email: req.session.email },
            { $pull: { goal: null } }
        );
        res.redirect('/goals'); // Redirect to the goals page after deletion
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).send('Error deleting goal'); // Send error response if deletion fails
    }
});

app.post('/contribute', async (req, res) => {
    const quantity = parseFloat(req.body.quantity); // Parse quantity as float
    const index = req.body.goalIndex; // Get the index from the request body

    // Retrieve the current value of the specified element of the goal array
    const user = await userCollection.findOne({ email: req.session.email });

    if (user && user.goal && user.goal[index]) {
        let currentGoalValue = user.goal[index][3]; // Assuming the specified element is an array with one item

        if (typeof currentGoalValue === 'number') {
            // Add the quantity to the current value
            const newValue = currentGoalValue + quantity;

            // Update the specified element of the goal array with the new value
            await userCollection.updateOne(
                { email: req.session.email },
                { $set: { [`goal.${index}.3`]: newValue } } // Assuming the specified element is an array with one item
            );
        }
    }

    res.redirect('/goals');
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

app.get('/ai', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    } else {
        res.render('ai');
    }
});

app.post('/ai', async (req, res) => {
    const line = req.body.line; // extracts the 'line' property from the request body
    const response = await openai.chat.completions.create({ // sends request to OpenAI API to generate a response
        model: 'gpt-3.5-turbo', 
        messages: [{"role":"user", "content":line}], 
        max_tokens: 20 
    })
    res.send(response['choices'][0]['message']['content'].trim()); 
});

// Function to select random exercises for the home page
function getRandomExercises(exercises, count) {
    const randomExercises = [];
    const totalExercises = exercises.length;
    const selectedIndices = new Set();

    // Ensure that the count doesn't exceed the total number of exercises
    count = Math.min(count, totalExercises);

    // Select unique random indices
    while (selectedIndices.size < count) {
        const randomIndex = Math.floor(Math.random() * totalExercises);
        if (!selectedIndices.has(randomIndex)) {
            selectedIndices.add(randomIndex);
            randomExercises.push(exercises[randomIndex]);
        }
    }

    return randomExercises;
}

app.get('/', async (req, res) => {
    if (req.session.authenticated) {
        //Credit: w3schools - create an array with all week day names, 
        //use date object to get current day, and use number returned to access day from array
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const d = new Date();
        let today = weekday[d.getDay()]
        let todaysWorkouts = await scheduleCollection
        .find({email: req.session.email})
        .project({[today]: 1})
        .toArray();
        try {
            // Read the JSON file
            const data = await fspromise.readFile("./dist/exercises.json", 'utf8');
            let jsonData = JSON.parse(data);

            let searchParam = req.query.search || "";

            if (searchParam) {
                jsonData = jsonData.filter(item => item.name.toLowerCase().includes(searchParam));
            }

            let filter = req.query.filter || "";
            if (filter) {
                jsonData = jsonData.filter(item => item.level === filter);
            }

            // Randomly select 3 exercises
            const exercisesInfo = getRandomExercises(jsonData, 3);

            // Fetch the user's goals from the database based on their email
            const result = await userCollection.findOne({ email: req.session.email });
            console.log(result);

            //get all the info about the current days exercise; used for linking the exercise to its full page 
            let workoutIDs = [];
            for (let i = 0; i < todaysWorkouts[0][today].length; i++) {
                for (let j = 0; j < jsonData.length; j++) {
                    if (todaysWorkouts[0][today][i] == jsonData[j].name) {
                        workoutIDs.push(jsonData[j]);
                        break;
                    }
                }
            }

            // Render the page with the random exercises and MongoDB result
            res.render('homeAuthenticated', { exercisesInfo, result, workoutNames: todaysWorkouts, workoutIDs: workoutIDs, currentDay: today });
        } catch (error) {
            // Handle error
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('homeUnauthenticated');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});
 
app.get("*", (req, res) => {
    console.log("404");
    res.status(404);
    res.render("404");
});


app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
