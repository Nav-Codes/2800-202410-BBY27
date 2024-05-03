//require("./utils.js");

//express constants
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs');
const path = require('path');

// Serve static files from the dist/exercises directory
app.use('/exercises', express.static(path.join('exercises')));
//port
const port = process.env.PORT || 3000;


require('dotenv').config();

//main mongo connector
const MongoStore = require('connect-mongo');
const saltRounds = 12;

const expireTime = 3600;

//crypt const
const bcrypt = require('bcrypt');

const Joi = require("joi");

//var {database} = include('databaseConnection.js');
//const userCollection = database.db(process.env.MONGODB_DATABASE).collection(process.env.MONGODB_COLLECTION);

app.use(express.urlencoded({ extended: false }));

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
})

app.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

app.get('/:id', (req, res) => {
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

            // Generate HTML for each exercise
            const exercisesHTML = filteredExercises.map(exercise => `
            <h3>${exercise.name}</h3>
            <img src="./exercises/${exercise.images[0]}" alt="${exercise.name}">
            <p>level: ${exercise.level}, equipment: ${exercise.equipment}</p>
            <p>muscles: ${exercise.primaryMuscles}</p>
            <p>${exercise.instructions}</p>
        `).join('');

            // Send the list of exercises as response
            res.send(`
            <ul>${exercisesHTML}</ul>
        `);
        });
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', (req, res) => {
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

            // Calculate pagination parameters
            const pageSize = 10; // Number of exercises per page
            const totalPages = Math.ceil(jsonData.length / pageSize);
            let currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified
            currentPage = Math.min(Math.max(currentPage, 1), totalPages); // Ensure current page is within valid range

            // Calculate the start and end indices of exercises for the current page
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, jsonData.length);

            // Extract names, images, and descriptions from the JSON data for the current page
            const exercisesInfo = jsonData.slice(startIndex, endIndex).map(item => ({
                name: item.name,
                images: item.images,
                instructions: item.instructions,
                id: item.id
            }));

            // Generate HTML for each exercise on the current page
            const exercisesHTML = exercisesInfo.map(exercise => `
                <li>
                    <a href="${exercise.id}">
                        <h3>${exercise.name}</h3>
                        <img src="./exercises/${exercise.images[0]}" alt="${exercise.name}">
                        <p>${exercise.instructions}</p>
                    </a>
                </li>
            `).join('');

            // Generate page counter links
            const pageLinks = Array.from({ length: totalPages }, (_, index) => index + 1)
                .map(page => `<a href="/?page=${page}"${page === currentPage ? ' class="active"' : ''}>${page}</a>`)
                .join(' | ');

            // Send the list of exercises for the current page as response
            res.send(`
                <h1>List of Exercises</h1>
                <ul>${exercisesHTML}</ul>
                <div>
                    Pages: ${pageLinks}
                </div>
            `);
        });
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get("*", (req, res) => {
    res.status(404);
    res.send("Page not found - 404");
})


app.listen(port, () => {
    console.log("Node application listening on port " + port);
}); 