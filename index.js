const express = require('express'),
    morgan = require('morgan');
const app = express();

let topMovies = [
     {
        title: "Harry Pötter and the Chamber of Secrets",
       director: "Chris Columbus",
    },
    {
      title: "Lord of the Rings: The Fellowship of the Ring",
      director: "Peter Jackson",
    },
    {
      title: "Pride and Prejudice",
      director: "Joe Wright",
    },
    {
      title: "Harry Potter and the Goblet of Fire",
      director: "Mike Newell",
    },
    {
      title: "Coco",
      director: "Lee Unkrich and Adrian Molina ",
    },
    {
      title: "The Lord of the Rings: The Two Towers",
      director: "Peter Jackson",
    },
    {
      title: "The Dark Knight",
      director: "Christopher Nolan",
    },
    {
      title: "Schindler's List",
      director: "Steven Spielberg",
    },
    {
      title: "Forrest Gump",
      director: "Robert Zemeckis",
    },
    {
      title: "Back to the Future",
      director: "Robert Zemeckis",
    },
];




app.use(express.static('public'));
app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('Welcome to my Moviedatabase MaFlix');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", { root: __dirname });
  });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Uh Oh, something isn't where it is supposed to be, i'll go looking, please try later");
});

app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});
