const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));






app.use((req, res, next) => {
    res.status(404).send("Sorry, we could not find the content.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));