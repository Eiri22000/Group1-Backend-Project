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
const freeEmployees = hbs.handlebars.registerHelper('getFreeEmployees', function (workers, assignedWorks, date) {
  const allReadyBookedWorkersForDate = []
  assignedWorks.map((oneWork) => {

    if (date === oneWork.date) {
      allReadyBookedWorkersForDate.push(oneWork.assignedWorkerId)
    }
  }
  )

  let freeWorkersForDate = workers.filter(worker => !allReadyBookedWorkersForDate.includes(worker._id.toString()));
  return freeWorkersForDate
})

module.exports = { isInArray, freeEmployees }