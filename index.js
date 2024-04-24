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
const { body, validationResult } = require('express-validator');
const { validateForm } = require('./models/validations');
const { randomImage } = require('./models/fetchplant.js');
const nodemailer = require('nodemailer')


//For email sending
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD
    }
})

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User');
const Worksite = require('./models/Worksite');
const { isInArray, freeEmployees } = require('./models/helpers.js');

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
    const openWorksites = await Worksite.find({ isAssigned: false }).sort({ date: 1 }).lean()
    const workers = await User.find().select('_id name').lean()
    const assignedWorksites = await Worksite.find({ isAssigned: true }).select('date assignedWorkerId').lean()
    const plant = await randomImage();
    const backGroundImage = plant.image
    const plantId = plant.plantId
    res.render('assignWorksite', { subtitle: 'Määritä työ työntekijälle', openWorksites: openWorksites, workers: workers, backGroundImage, plantId, message: feedbackMessage, allReadyAssignedWorks: assignedWorksites })
})

app.post('/assignWorksite', async (req, res) => {
    const assignedWorksitesToDB = req.body
    let emailResponse

    try {
        for (const worksite of assignedWorksitesToDB) {
            await Worksite.updateOne({ _id: worksite.worksiteId }, {
                isAssigned: true,
                assignedWorkerId: worksite.employeeId
            })
            // try {
            //     await sendEmail(worksite.worksiteId)
            //     emailResponse = "Sähköpostiviesti lähetetty."
            // } catch (emailError) {
            //     emailResponse = `Sähköpostin lähettäminen epäonnistui : ${emailError}`
            // }
            res.status(200).json({ message: `Valitut työt merkitty tekijöilleen! ${emailResponse}` })
        }
    } catch (error) {
        res.status(500).json({ message: `Määritys epäonnistui! Virhe: ${error.message}.` })
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
        const works = await Worksite.find({ assignedWorkerId: worker }, { workIsDone: false }).lean();
        const plant = await randomImage();
        const backGroundImage = plant.image;
        const plantId = plant.plantId;
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
            date: req.body.date,
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

app.post('/updateWorkDone', async (req, res) => {
    const worksiteIdsToUpdate = req.body.worksiteIds;
    const worker = "661d33c58f866f3f675f05a2";
    const workerName = await User.findOne({ _id: worker }).lean();
    const works = await Worksite.find({ assignedWorkerId: worker }).lean();
    const plant = await randomImage();
    const backGroundImage = plant.image;
    const plantId = plant.plantId;

    try {
        await Worksite.updateMany(
            { _id: { $in: worksiteIdsToUpdate } },
            { workIsDone: true }
        );
        res.status(200).render('gardener', { subtitle: 'Puutarhurin työlista', message: `Työ kuitattu valmiiksi`, Worksite: works, backGroundImage, plantId, User: workerName });
    } catch (error) {
        res.status(500).render('gardener', { subtitle: 'Puutarhurin työlista', message: `Tietoja ei päivitetty. Virhe: ${error.message}`, Worksite: works, backGroundImage, plantId, User: workerName });
    }
});

app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});


async function sendEmail(worksiteId) {
    const worksiteInfo = await Worksite.find({ _id: worksiteId }).select('customerName city tasks additionalInformation date').lean()
    let tasks
    worksiteInfo[0].tasks.map(task => {
        tasks += `<li>${task}</li>`
    });

    if (worksiteInfo[0].additionalInformation !== "") {
        tasks += `<li>${worksiteInfo[0].additionalInformation}</li>`
    }

    // Send email to assigned worker with worksite info
    const newEmail = {
        from: process.env.EMAILUSER,
        to: 'anne22015@student.hamk.fi',
        subject: 'Sinulle on määrätty uusi työkohde',
        html: `<h1>${worksiteInfo[0].customerName}, ${worksiteInfo[0].city}</h1><h2>${worksiteInfo[0].date}</h2><h3>Työtehtävät ja lisätiedot</h3><ul>${tasks}</ul></br></br><p>Lisätietoja kohteesta näet omalta työsivultasi.</br> Kaivamisiin! T: Pena</p>`,
    }

    const response = await transporter.sendMail(newEmail, function (error, info) {

        if (error) {
            console.log('Error: ', error);
        } else {
            console.log('Sähköposti lähetetty.')
        }

    })
}