const express = require('express');
const mongoose = require('mongoose')
require('dotenv').config()
const exphbs = require('express-handlebars');

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User')
const Worksite = require('./models/Worksite')
const AppointedWorksites = require('./models/AppointedWorksites')

//Wait for database connection and when succesful make the app listen to port 3000
mongoose.connect(dbURI)
    .then((result) => {
        console.log('Database access succesful!')
        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => console.log('Listening port: ' + PORT))
    })
    .catch((error) => {
        console.log('Error occurred connecting to database: ' + error)
    })

const app = express();
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));


// Main page
app.get('/', (req, res) => {
    res.render('index',
    { 
    title: 'Penan Puutarha'
    });
});

// ROUTES //
app.get('/admin', async (req, res) => {
    const users = await User.find()
    res.render('admin', { title: 'Työntekijät', workers: users })
})

app.use((req, res, next) => {
    res.status(404).send("Sorry, we could not find the content.");
});

