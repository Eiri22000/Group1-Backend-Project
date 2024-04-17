const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const router = express.Router();
module.exports = router;
require('esm-hook');
const fetch = require('node-fetch').default;

const dbURI = 'mongodb+srv://' + process.env.DBUSERNAME + ':' + process.env.DBPASSWORD + '@' + process.env.CLUSTER + '.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority&appName=Cluster0'

//Import custom modules
const User = require('./models/User');
const Worksite = require('./models/Worksite');
const AppointedWorksites = require('./models/AppointedWorksites');
const createMongoDBView = require('./models/createView');

//Wait for database connection and when succesful make the app listen to port 3000
mongoose.connect(dbURI)
    .then((result) => {
        console.log('Database access succesful!')
        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => console.log('Listening port: ' + PORT))
        createMongoDBView();
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


// Parse JSON request body
app.use(express.json());

// Get plant photo from Perenual Plan API

//     fetch('https://perenual.com/api/species/details/1?key=sk-aQC8661e7af0453875143')
//     .then(req => req.json())
//     .then(json => console.log(json.default_image))
// .catch(console.error);





// ROUTES //

// Define authentication routes
app.use('/auth', authRoutes);

// Define user routes
app.use('/user', userRoutes);


app.get('/', (req, res) => {
    res.render('index',
        {
            title: 'Penan Puutarha',
            subtitle: 'Tervetuloa Penan Puutarhalle!'
        });
});

app.get('/admin', async (req, res) => {
    const users = await User.find().lean()
    res.render('admin', { subtitle: 'Työntekijöiden hallinta', workers: users })
})

app.get('/assignWorksite', async (req, res) => {
    const openWorksites = await Worksite.find().lean()
    const workers = await User.find().select('_id, name').lean()
    res.render('assignWorksite', { subtitle: 'Määritä työ työntekijälle', openWorksites: openWorksites, workers: workers })
})

app.post('/assignWorksite', async (req, res) => {
    const assignedWorksitesToDB = req.body
    for (const worksite of assignedWorksitesToDB) {
        const workerNames = await User.findOne({ _id: worksite.workerId }).lean()
        let workerUserName = workerNames.username
        let workerFullName = workerNames.name

        const newAssignedWorksite = new AppointedWorksites({
            date: worksite.date,
            customerName: worksite.customer,
            chores: worksite.chores,
            worker: workerFullName,
            workerFullName: workerUserName
        })
        await newAssignedWorksite.save()
    }

})

app.get('/gardener', async (req, res) => {
    try {
        /*const worker = req.session.worker;*/
        worker = "eirnen167";
        const works = await AppointedWorksites.find({ worker: worker }).lean();
        res.render('gardener', { subtitle: 'Puutarhurin työlista', AppointedWorksites: works });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/workIntake', async (req, res) => {
    res.render('workIntake', { subtitle: 'Tilaa työ puutarhaasi' })
})

app.post('/saveFormToDB', async (req, res) => {
    console.log(req.body)
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
                    .catch(error => {
                        console.log("Virhe" + error)
                        //res.redirect('admin'), { message: "Tallennus epäonnistui." }
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
    try {
        const work = new Worksite({
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            workAddress: req.body.workAddress,
            postalCode: req.body.postalCode,
            city: req.body.city,
            tasks: req.body.tasks,
            additionalInformation: req.body.additionalInformation
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


app.use((req, res, next) => {
    res.status(404).send("Haluamaasi sisältöä ei löytynyt. Tarkasta osoite..");
});