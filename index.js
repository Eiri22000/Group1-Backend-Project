const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const router = express.Router();
const fetch = require('node-fetch');
module.exports = router;
require('esm-hook');

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User');
const Worksite = require('./models/Worksite');
const AppointedWorksites = require('./models/AppointedWorksites');
const workerWorksView = require('./models/createWorkerWorksView');
const { weatherAPI } = ('.middlewares/weatherAPI');

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

// Connect to MongoDB, this is not working
//const database = connectDB();

const app = express();
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));

// Parse JSON request body
app.use(express.json());

// ROUTES //

// Define authentication routes
app.use('/auth', authRoutes);

// Define user routes
app.use('/user', userRoutes);

app.get('/weather', (req, res) => {
    const location = req.query.location || 'Helsinki';
    const date = req.query.date || '2024-04-22';
  
    fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}/${date}?unitGroup=metric&elements=name%2Ctempmax%2Ctempmin%2Chumidity%2Cuvindex%2Csunrise%2Csunset&key=T37KJYM23DQGRSGFQ3786MD5V&contentType=json`, {
      method: 'GET',
      headers: {}
    })
    .then(response => response.json())
    .then(data => {
      res.json(data); // Send the fetched data as JSON response
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Error fetching weather data' }); // Send an error response if fetching fails
    });
  });

app.get('/', async (req, res) => {
    try {
        const backGroundImage = await randomImage();
        res.render('index', { 
            backGroundImage,
            title: 'Penan Puutarha', 
            subtitle: 'Tervetuloa Penan Puutarhalle!' 
        });
    } catch (error) {
        console.error(error);
        res.render('index', { 
            backGroundImage: 'testBackground.jpg', 
            title: 'Penan Puutarha', 
            subtitle: 'Tervetuloa Penan Puutarhalle!' 
        });
    }
});

app.get('/admin', async (req, res) => {
    const users = await User.find().lean()
    const backGroundImage = await randomImage();
    res.render('admin', { subtitle: 'Työntekijöiden hallinta', workers: users, backGroundImage })
})

app.get('/assignWorksite', async (req, res) => {
    const openWorksites = await Worksite.find({ isAssigned: false }).lean()
    const workers = await User.find().select('_id, name').lean()
    const backGroundImage = await randomImage();
    res.render('assignWorksite', { subtitle: 'Määritä työ työntekijälle', openWorksites: openWorksites, workers: workers, backGroundImage })
})

app.post('/assignWorksite', async (req, res) => {
    const assignedWorksitesToDB = req.body
    for (const worksite of assignedWorksitesToDB) {
        await Worksite.updateOne({ _id: worksite.worksiteId }, {
            isAssigned: true,
            assignedWorkerId: worksite.employeeId
        })
            .then(console.log("Onnistui"))
            .catch(error => console.log(error))
    }
})

app.get('/gardener', async (req, res) => {
    try {
        const worker = "661d33c58f866f3f675f05a2";
        const workerName = await User.find({id: worker}).lean();
        const works = await Worksite.find({ assignedWorkerId: worker }).lean();
        const backGroundImage = await randomImage();
        res.render('gardener', { subtitle: 'Puutarhurin työlista', Worksite: works, backGroundImage, User: workerName });
    } catch (error) {
        // Log the full error for debugging purposes
        console.error(error);
        // Send an error response with a generic message
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/workIntake', async (req, res) => {
    try {
    const backGroundImage = await randomImage();
    res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi', imageUrl:'testBackground.jpg', backGroundImage
 })
    }
    catch (error) {
        console.log(error)
    }
})

app.post('/saveFormToDB', async (req, res) => {
    try {
        switch (req.body.type) {
            case "addEmployee":
                const newEmployee = new User({
                    name: req.body.employeeName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.username,
                    role: "worker"
                })
                await newEmployee.save()
                    .then(res.redirect('admin'), { message: "Uusi työntekijä tallennettu!" })
                    .catch(error =>
                        console.log("Virhe" + error)
                        //res.redirect('admin'), { message: "Tallennus epäonnistui." }
                    )
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

app.post('/updateDB', async (req, res) => {
    try {
        switch (req.body.type) {
            case "editEmployee":
                await User.updateOne({ _id: req.body.hiddenId }, {
                    name: req.body.employeeName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email
                })
                    .then(res.redirect('admin'), { message: "Tiedot päivitetty onnistuneesti!." })
                    .catch(error => {
                        res.render('admin'), { message: "Tallennus epäonnistui." }
                    })
                break
            case "removeEmployee":
                await User.deleteOne({ _id: req.body.idToRemove })
                    .then(res.redirect('admin'))
                    .catch(error => console.log('Poisto epäonnistui: ' + error))
                break
        }
    }
    catch (error) {
        console.log(error)
    }
})

// Add a work
app.post('/addWork', async (req, res) => {
    //format date to common finnish date format
    const date = new Date(req.body.date)
    const formatter = new Intl.DateTimeFormat('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const formattedDate = formatter.format(date)

    try {
        const work = new Worksite({
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            workAddress: req.body.workAddress,
            postalCode: req.body.postalCode,
            city: req.body.city,
            date: formattedDate,
            tasks: req.body.tasks,
            additionalInformation: req.body.additionalInformation,
            isAssigned: false
        })
        await work.save()
            .then(res.redirect('workIntake'))
    }
    catch (error) {
        console.log(error)
    }
})

app.delete('/deleteWorksite', async (req, res) => {
    try {
        await Worksite.deleteMany({ _id: { $in: req.body } });
        res.status(200).json({ message: "Valitsemasi työt poistettu!" })
    } catch {

        res.status(500).json({ message: "Poisto epäonnistui." })
    }
})


// Get plant photo from Perenual Plan API
const randomImage = async() => {
    var image = "testBackground.jpg"
    try{
        const number = Math.floor(Math.random() * 3001)
        await fetch('https://perenual.com/api/species/details/' + number + '?' + new URLSearchParams({
            key: process.env.PLANTAPIKEY,
        }))
        .then(req => req.json())
        .then(json => json.default_image)
        .then(function(defImage) {
            //If lausetta ei kerennyt kokeilla vielä ennenkuin loppu api
            if ( defImage.original_url !== undefined || defImage.original_url !== null) {
                 image = defImage.regular_url
            }
        })
    }
    catch (error) {
        console.log(error)
    }

}

app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});