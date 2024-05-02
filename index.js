const express = require('express');


const port = process.env.PORT || 3000;

const app = express();


const axios = require('axios');

// Your wger API token
const API_TOKEN = ' 99c85ff786bb388090f1de86bd2049c0b2ab81ae';

// Endpoint URL
const apiUrl = 'https://wger.de/api/v2/';

app.get('/', async (req, res) => {
    try {
        // Make a request to the wger API to get a list of exercises
        const response = await axios.get(apiUrl + 'exercise/?language=2', {
            headers: {
                'Authorization': `Token ${API_TOKEN}`
            }
        });
        
        // Extract the list of exercises from the response data
        const exercises = response.data.results;
        
        // Render the main page with the list of exercises
        res.send(`
            <h1>List of Exercises</h1>
            <ul>
                ${exercises.map(exercise => `<li>${exercise.name}</li>`).join('')}
            </ul>
        `);
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
	console.log("Node application listening on port "+port);
}); 