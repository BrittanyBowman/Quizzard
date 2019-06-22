const express = require ('express');
require('./auth/passport.auth');
require('dotenv').config({path: `${__dirname}/.env`});


//requiring db stuff
const mongoose = require('mongoose');

const User = require('./db/models/User.model');
//requiring middleware 

const { decorate } = require('./middleware/global.middleware');

const { addRoutes} = require('./routers/routers');

const { PORT } = process.env;



mongoose.connect(process.env.DB_CONNECTION_STRING)
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




// app.get('/api/users',)
// app.get('/api/quizzes', )
// app.get('/api/quiz/:id', )









app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
})