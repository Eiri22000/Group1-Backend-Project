const { body, validationResult } = require('express-validator');

const validateForm = () => {
    return [
        body('customerName')
        .trim()
        .notEmpty().withMessage('Nimi on pakollinen.')
        .escape()
        .matches(/^[a-zA-Z\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Vain kirjaimet ovat sallittuja nimessä.'),

        body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Puhelinnumero on pakollinen.')
        .escape()
        .isInt({ allow_leading_zeroes: true }).withMessage('Puhelinnumerossa saa olla vain numeroita.'),

        body('email')
        .trim()
        .notEmpty().withMessage('Sähköpostiosoite on pakollinen.')
        .escape()
        .isEmail().withMessage('Sähköpostissa virhe. Tarkasta osoite.'),

        body('workAddress')
        .trim()
        .notEmpty().withMessage('Työn sijainnin osoite on pakollinen.')
        .escape()
        .matches(/^[a-zA-Z0-9\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Vain kirjaimet ja numerot ovat sallittuja osoitteessa.'),

        body('postalCode')
        .trim()
        .notEmpty().withMessage('Postinumero on pakollinen.')
        .escape()
        .isNumeric().withMessage('Postinumerossa saa olla vain numeroita.'),

        body('city')
        .trim()
        .notEmpty().withMessage('Paikkakunta on pakollinen.')
        .escape()
        .matches(/^[a-zA-Z\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/).withMessage('Paikkakunnan nimessä voi olla vain kirjaimia.'),

        body('date')
        .trim()
        .notEmpty().withMessage('Päivämäärä on pakollinen.')
        .escape()
        .isDate().withMessage('Päivämäärävirhe, syötä muodossa dd/mm/yyyy.').custom((value, { req }) => {
            const thisDate = new Date();
            if (new Date(value) <= thisDate) {
                throw new Error('Päivämäärä saa olla aikaisintaan huominen.')
            }
            return true;
        }),
        body('tasks').escape(),

        body('additionalInformation')
        .escape()
        .isLength({ max: 200 }).withMessage('Lisäsarakkeen maksimipituus on 200 merkkiä.'),
];

}


module.exports = {validateForm}