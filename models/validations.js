const { body, validationResult } = require('express-validator');

const lettersOnly = () => {
    return [
        body('customerName')
        .trim()
        .notEmpty().withMessage('Nimi on pakollinen.')
        .escape()
        .matches(/^[a-zA-Z\u00C4\u00E4\u00D6\u00F6\u00C5\u00E5\s]+$/)
        .withMessage('Vain kirjaimet, ä, ö, å ja välilyönnit ovat sallittuja nimessä.')
];

}


module.exports = {lettersOnly}