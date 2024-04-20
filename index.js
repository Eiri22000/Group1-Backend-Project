const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const router = express.Router();
module.exports = router;
require('esm-hook');
const fetch = require('node-fetch').default;
const { body, validationResult } = require('express-validator');
const { lettersOnly } = require('./models/validations')

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User');
const Worksite = require('./models/Worksite');
const AppointedWorksites = require('./models/AppointedWorksites');
const workerWorksView = require('./models/createWorkerWorksView');

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
    let feedbackMessage = ""
    if (req.query.message) {
        feedbackMessage = req.query.message
    }
    const openWorksites = await Worksite.find({ isAssigned: false }).lean()
    const workers = await User.find().select('_id, name').lean()
    const backGroundImage = await randomImage();
    res.render('assignWorksite', { subtitle: 'Määritä työ työntekijälle', openWorksites: openWorksites, workers: workers, backGroundImage, message: feedbackMessage })
})

app.post('/assignWorksite', async (req, res) => {
    const assignedWorksitesToDB = req.body
    for (const worksite of assignedWorksitesToDB) {
        try {
            await Worksite.updateOne({ _id: worksite.worksiteId }, {
                isAssigned: true,
                assignedWorkerId: worksite.employeeId
            })
            res.status(200).json({ message: "Valitut työt merkitty tekijöilleen!" })
        } catch (error) {
            res.status(500).json({ message: `Määritys epäonnistui! Virhe: ${error.message}` })
        }
    }
})

app.delete('/deleteWorksite', async (req, res) => {
    try {
        await Worksite.deleteMany({ _id: { $in: req.body } });
        res.status(200).json({ message: "Valitsemasi työt poistettu!" })
    } catch (error) {
        res.status(500).json({ message: `Poisto epäonnistui! Virhe: ${error.message}` })
    }
})

app.get('/gardener', async (req, res) => {
    try {
        const worker = "661d33c58f866f3f675f05a2";
        const workerName = await User.find({ id: worker }).lean();
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
        res.render('workIntake', {
            subtitle: 'Tilaa työ puutarhaasi', backGroundImage
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.post('/saveFormToDB', async (req, res) => {
    const backGroundImage = await randomImage();
    const newEmployee = new User({
        name: req.body.employeeName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        username: req.body.username,
        password: req.body.username,
        role: "worker"
    })
    try {
        await newEmployee.save()
        const users = await User.find().lean()
        res.render('admin', { subtitle: "Työntekijöiden hallinta", message: "Uusi työntekijä tallennettu!", workers: users, backGroundImage })
    }
    catch (error) {
        res.status(500).render('admin', { subtitle: "Työntekijöiden hallinta", message: `Tallennus epäonnistui: ${error.message}`, workers: users, backGroundImage })
    }
})

app.post('/updateDB', async (req, res) => {
    const backGroundImage = await randomImage();
    try {
        switch (req.body.type) {
            case "editEmployee":
                await User.updateOne({ _id: req.body.hiddenId }, {
                    name: req.body.employeeName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email
                })
                break
            case "removeEmployee":
                await User.deleteOne({ _id: req.body.idToRemove })
                break
        }
        const users = await User.find().lean()
        res.status(200).render('admin', { subtitle: "Työntekijöiden hallinta", message: "Tiedot päivitetty onnistuneesti!", workers: users, backGroundImage })
    }
    catch (error) {
        res.status(500).render('admin', { subtitle: "Työntekijöiden hallinta", message: `Tietoja ei päivitetty. Virhe: ${error.message}`, workers: users, backGroundImage })
    }
})

// Add a work
app.post('/addWork',
    // Validate and sanitize adding-work-form
    [
        body('customerName').trim().notEmpty().withMessage('Nimi on pakollinen.').escape().matches(/^[a-zA-Z\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Vain kirjaimet ovat sallittuja nimessä.'),
        body('phoneNumber').trim().notEmpty().withMessage('Puhelinnumero on pakollinen.').escape().isInt({ allow_leading_zeroes: true }).withMessage('Puhelinnumerossa saa olla vain numeroita.'),
        body('email').trim().notEmpty().withMessage('Sähköpostiosoite on pakollinen.').escape().isEmail().withMessage('Sähköpostissa virhe. Tarkasta osoite.'),
        body('workAddress').trim().notEmpty().withMessage('Työn sijainnin osoite on pakollinen.').escape().matches(/^[a-zA-Z0-9\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Vain kirjaimet ja numerot ovat sallittuja osoitteessa.'),
        body('postalCode').trim().notEmpty().withMessage('Postinumero on pakollinen.').escape().isNumeric().withMessage('Postinumerossa saa olla vain numeroita.'),
        body('city').trim().notEmpty().withMessage('Paikkakunta on pakollinen.').escape().matches(/^[a-zA-Z\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Paikkakunnan nimessä voi olla vain kirjaimia.'),
        body('date').trim().notEmpty().withMessage('Päivämäärä on pakollinen.').escape().isDate().withMessage('Päivämäärävirhe, syötä muodossa dd/mm/yyyy.').custom((value, { req }) => {
            const thisDate = new Date();
            if (new Date(value) <= thisDate) {
                throw new Error('Päivämäärä saa olla aikaisintaan huominen.')
            }
            return true;
        }),
        body('tasks').escape(),
        body('additionalInformation').escape().isLength({ max: 200 }).withMessage('Lisäsarakkeen maksimipituus on 200 merkkiä.'),
    ],
    async (req, res) => {
        //format date to common finnish date format
        const date = new Date(req.body.date)
        const formatter = new Intl.DateTimeFormat('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const formattedDate = formatter.format(date)

    try {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array().map(error => error.msg)
       
        return res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi', backGroundImage: "testBackground.jpg", message:"Korjaa virheet lomakkeessa: " + errors, formData: req.body})
    }
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
            .then(res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi', backGroundImage: "testBackground.jpg", message: 'Työsi on tallennettu onnistuneesti. Olemme tarvittaessa yhteydessä!'}))
    }
    catch (error) {
        res.status(500).send('Server error')
    }
})



// Get plant photo from Perenual Plan API
const randomImage = async () => {
    var image = "testBackground.jpg"
    try {
        const number = Math.floor(Math.random() * 3001)
        await fetch('https://perenual.com/api/species/details/' + number + '?' + new URLSearchParams({
            key: process.env.PLANTAPIKEY,
        }))
            .then(req => req.json())
            .then(json => json.default_image)
            .then(function (defImage) {
                //If lausetta ei kerennyt kokeilla vielä ennenkuin loppu api
                if (defImage.original_url !== undefined || defImage.original_url !== null) {
                    image = defImage.regular_url
                }
            })
    }
    catch (error) {
        console.log('Plant-API did not provide image of plant. Using default image')
    }
    return image
}

app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});