const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
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
app.use(express.urlencoded({ extended: true }))
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
    const users = await User.find().lean()
    res.render('admin', { subtitle: 'Työntekijöiden hallinta', workers: users })
})

app.get('/gardener', async (req, res) => {
    const users = await User.find().lean()
    res.render('gardener', { title: 'Puutarhurin työlista', workers: AppointedWorksites })
})

app.get('/workIntake', async (req, res) => {
    res.render('workIntake', { title: 'Tilaa työ puutarhaasi' })
})

app.post('/saveFormToDB', async (req, res) => {
    try {
        switch (req.body.type) {
            case "addEmployee":
                const newEmployee = new User({
                    name: req.body.employeeName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email,
                    role: "worker"
                })
                await newEmployee.save()
                    .then(res.redirect('admin'), { message: "Uusi työntekijä tallennettu!" })
                    .catch(error => {
                        res.redirect('admin'), { message: "Tallennus epäonnistui." }
                    })
                break;
            case "addWorksite":

                break;
            default:
                res.send("Virhe tallennuksessa.")
        }
    }
    catch (error) {
        console.log(error)
    }
})

// Add a work
app.post('/addWork', async (req, res) => {
    try {
        const work = new Worksite(req.body)
        console.log(req.body)
        await work.save()
        res.send('<h3>Tilaus lisätty järjestelmään</h2><p>Kiitos tilauksesta!</h1>')
    }

    catch (error) {
        console.log(error)
    }
})


app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});

