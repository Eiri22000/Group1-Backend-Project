const nodemailer = require('nodemailer')
const Worksite = require('../models/Worksite')

//For email sending
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD
    }
})


const sendEmail = async (worksiteId) => {
    const worksiteInfo = await Worksite.find({ _id: worksiteId }).select('customerName city tasks additionalInformation date').lean()
    let tasks = ""
    let date = worksiteInfo[0].date
    date = date.getDate() + "." + date.getMonth() + "." + date.getFullYear()
    worksiteInfo[0].tasks.map(task => {
        tasks += `<li>${task}</li>`
    });

    if (worksiteInfo[0].additionalInformation !== "") {
        tasks += `<li>Lisätiedot: ${worksiteInfo[0].additionalInformation}</li>`
    }

    // Send email to assigned worker with worksite info
    const newEmail = {
        from: process.env.EMAILUSER,
        to: 'anne22015@student.hamk.fi',
        subject: 'Sinulle on määrätty uusi työkohde',
        html: `<h1>${worksiteInfo[0].customerName}, ${worksiteInfo[0].city}</h1><h2>${date}</h2><h3>Työtehtävät ja lisätiedot</h3><ul>${tasks}</ul></br></br><p>Lisätietoja kohteesta näet omalta työsivultasi.</br> Kaivamisiin! T: Pena</p>`,
    }

    const response = await transporter.sendMail(newEmail, function (error, info) {

        if (error) {
            console.log('Error: ', error);
        } else {
            console.log('Sähköposti lähetetty.')
        }

    })
}

module.exports = { sendEmail };

