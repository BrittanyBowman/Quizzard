require('dotenv').config({path: `${__dirname}/.env`});
const path = require('path');
const express = require ('express');
require('./auth/passport.auth');


//requiring db stuff
const mongoose = require('mongoose');

const User = require('./db/models/User.model');
//requiring middleware 
const { PORT, DB_CONNECTION_STRING } = process.env;

const { decorate } = require('./middleware/global.middleware');

const { addRoutes} = require('./routers/routers');


mongoose.connect(DB_CONNECTION_STRING)
    .then(() => {
        console.log('connected to the database');
    })
    .catch(err => {
        console.error('Error connecting to the database');
        console.error(err);
    });


const app = express();



decorate(app);

addRoutes(app);


//serves up our build folder
app.use(express.static(__dirname + '/../build'))

//sends index.html file from the build folder
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

//listening on assigned port
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})