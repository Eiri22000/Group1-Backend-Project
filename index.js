const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const router = express.Router();
// const fetch = require('node-fetch');
module.exports = router;
require('esm-hook');
const { body, validationResult } = require('express-validator');
const { validateForm } = require('./models/validations');

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User');
const Worksite = require('./models/Worksite');
const { isInArray } = require('./models/helpers.js');

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
        const plant = await randomImage();
        const backGroundImage = plant.image
        const plantId = plant.plantId
        res.render('index', {
            backGroundImage, plantId,
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
    const plant = await randomImage();
    const backGroundImage = plant.image
    const plantId = plant.plantId
    res.render('admin', { subtitle: 'Työntekijöiden hallinta', workers: users, backGroundImage, plantId })
})

app.get('/assignWorksite', async (req, res) => {
    let feedbackMessage = ""
    if (req.query.message) {
        feedbackMessage = req.query.message
    }
    const openWorksites = await Worksite.find({ isAssigned: false }).sort({ date: -1 }).lean()
    const workers = await User.find().select('_id name').lean()
    const assignedWorksites = await Worksite.find({ isAssigned: true }).select('date assignedWorkerId').lean()
    const plant = await randomImage();
    const backGroundImage = plant.image
    const plantId = plant.plantId
    res.render('assignWorksite', { subtitle: 'Määritä työ työntekijälle', openWorksites: openWorksites, workers: workers, backGroundImage, plantId, message: feedbackMessage, allReadyAssignedWorks: assignedWorksites })
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
        const plant = await randomImage();
        const backGroundImage = plant.image
        const plantId = plant.plantId
        res.render('gardener', { subtitle: 'Puutarhurin työlista', Worksite: works, backGroundImage, plantId, User: workerName });
    } catch (error) {
        // Log the full error for debugging purposes
        console.error(error);
        // Send an error response with a generic message
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/workIntake', async (req, res) => {
    try {
        const plant = await randomImage();
        const backGroundImage = plant.image
        const plantId = plant.plantId
        res.render('workIntake', {
            subtitle: 'Tilaa työ puutarhaasi', backGroundImage, plantId
        })
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/plantInfo', async (req, res) => {
    const plantId = (req.query.id)
    try {
        const plant = await randomImage(plantId);
        const backGroundImage = plant.image
        const plantInfo = plant.info
        res.render('plantInfo', {
            subtitle: 'Lisätietoa taustakuvan kasvista', backGroundImage, plantId, plantInfo
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
app.post('/addWork', validateForm(), async (req, res) => {
    //format date to common finnish date format
    const date = new Date(req.body.date)
    const formatter = new Intl.DateTimeFormat('fi-FI', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const formattedDate = formatter.format(date)

    try {
        const validationErrors = validationResult(req)
        // If there are validation errors, user is redirected to fix errors in form with error message
        if (!validationErrors.isEmpty()) {
            const errors = validationErrors.array().map(error => error.msg)
            return res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi', backGroundImage: "testBackground.jpg", message: "Korjaa virheet lomakkeessa: " + errors, formData: req.body })
        }
        // Without errors, save and direct back with message
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
            isAssigned: false,
            workIsDone: false
        })
        await work.save()
            .then(res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi', backGroundImage: "testBackground.jpg", message: 'Työsi on tallennettu onnistuneesti. Olemme tarvittaessa yhteydessä!' }))
    }
    catch (error) {
        res.status(500).send('Server error')
    }
})

app.post('/gardenerWorkDone', async (req, res) => {
    const { worksiteId, workIsDone } = req.body;

    try {
        // Find the worksite by ID and update the workIsDone field
        const updatedWorksite = await Worksite.findByIdAndUpdate(worksiteId, { workIsDone }, { new: true });

        if (!updatedWorksite) {
            return res.status(404).json({ error: 'Worksite not found' });
        }

        // Respond with the updated worksite
        res.json(updatedWorksite);
    } catch (error) {
        console.error('Error updating worksite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get plant photo from Perenual Plan API
const randomImage = async (number) => {
    // Call from plantInfo has an plantId to get info from specific plant, otherwise use random to create background
    if (number === undefined) {
        number = Math.floor(Math.random() * 3001)
    }
    // Set image from public folder as a default
    var image = "testBackground.jpg"
    var info = { name: "Zebra Plant", scientificName: "Calathea orbifolia", image: "testBackground.jpg", light: "Half shade", propagation: "seeds, division", watering: "Keep moist" }
    var plantId = 6000
    // try {
    //     await fetch('https://perenual.com/api/species/details/' + number + '?' + new URLSearchParams({
    //         key: process.env.PLANTAPIKEY,
    //     }))
    //         .then(res => res.json())
    //         .then(json => {
    //             plantId =json.id;
    //             info = {name:json.common_name, scientificName:json.scientific_name, image: json.original_url, light:json.sunlight, propagation:json.propagation, watering:json.watering}
    //             const defImage =json.default_image
    //             if (defImage.original_url !== undefined || defImage.original_url !== null) {
    //                         image = defImage.regular_url
    //             }
    //         })

    // }
    // catch (error) {
    //     console.log('Plant-API did not provide image of plant. Using default image')
    // }
    return { image, plantId, info }
}

app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});