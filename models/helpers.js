const exphbs = require('express-handlebars');
require('esm-hook');
var hbs = exphbs.create({});

// To check if given value is in array
const isInArray = hbs.handlebars.registerHelper('contains', function (array, value) {
  if (array.includes(value)) {
    return "checked";
  }
})

//Check for free workers
const freeEmployees = hbs.handlebars.registerHelper('getFreeEmployees', function (assigned, unAssigned) {
  assigned.pop()
  return assigned
})

module.exports = { isInArray, freeEmployees }