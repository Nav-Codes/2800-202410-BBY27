require("./utils.js");

//express constants
const express = require('express');
const app = express();
const session = require('express-session');

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

var {database} = include('databaseConnection.js');
const userCollection = database.db(process.env.MONGODB_DATABASE).collection(process.env.MONGODB_COLLECTION);

app.use(express.urlencoded({extended: false}));

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