const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies =Models.Movie;
const Users = Models.User;

const express = require('express'),
app = express(),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');

mongoose.connect('mongodb://localhost:27017/myFlixDB?directConnection=true', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(morgan('common'));

/*
let users = [
  {
		id: 1,
		name: 'Karl',
		favoriteMovies: [],
	},
	{
		id: 2,
		name: 'Krone',
		favoriteMovies: 'Title 2',
	},
];

let movies = [
  {
		Title: 'The Fountain',
		Description: 'Description 1',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 1',
			Bio: 'Bio Director 1',
			Birth: 1969,
		},
	},
	{
		Title: 'Title 2',
		Description: 'Description 2',
		Genre: {
			Name: 'Action',
			Description: 'Description Genre Action',
		},
		Director: {
			Name: 'Director 2',
			Bio: 'Bio Director 2',
			Birth: 1972,
		},
	},
	{
		Title: 'Title 3',
		Description: 'Description 3',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 3',
			Bio: 'Bio Director 3',
			Birth: 1980,
		},
	},
	{
		Title: 'Title 4',
		Description: 'Description 4',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 4',
			Bio: 'Bio Director 4',
			Birth: 1981,
		},
	},
	{
		Title: 'Title 5',
		Description: 'Description 5',
		Genre: {
			Name: 'Drama',
			Description: 'Description Genre Drama',
		},
		Director: {
			Name: 'Director 5',
			Bio: 'Bio Director 5',
			Birth: 1982,
		},
	},
    {
      Title: 'MovieName',
      Description: 'Description',
      Genre: {
        Name: 'GenreName',
        Description: 'DramaDescription',
      },
      Director: {
        Name: 'DirectorName',
        Bio: 'DirectorBio',
        Birth: 1980,
      },
    },

  ];
*/

//Welcome
app.get('/', (req, res) => {
  res.send('Welcome to my Moviedatabase MyFlix');
});


//Create User
/* We'll expect JSON in this format
{
	ID: Integer,
	Username: String,
	Pasword: String,
	Email: String,
	Birthday: Date
}*/
app.post('users', (req, res) => {
	Users.findOne({ Username: req.body.Username })
	.then((user) => {
		if (user) {
			return res.status(400).send(req.body.Username + 'already exists');
		} else {
			Users
				.create({
					Username: req.body.Username,
					Password: req.body.Password,
					Email: req.body.Email,
					Birthday: req.body.Birthday
				})
				.then((user) => {res.status(201).json(user) })
				.catch((error) => {
					console.error(error);
					res.status(500).send('Error: ' + error);
				})
		}
	})
	.catch((error) => {
		console.error(error);
		res.status(500).send('Error: ' + error);
	});
});

// Get all users
app.get('/users', (req, res) => {
	Users.find()
	  .then((users) => {
		res.status(201).json(users);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });

  // Get a user by username
app.get('/users/:Username', (req, res) => {
	Users.findOne({ Username: req.params.Username })
	  .then((user) => {
		res.json(user);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });

  // Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
	  {
		Username: req.body.Username,
		Password: req.body.Password,
		Email: req.body.Email,
		Birthday: req.body.Birthday
	  }
	},
	{ new: true }, // This line makes sure that the updated document is returned
	(err, updatedUser) => {
	  if(err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  } else {
		res.json(updatedUser);
	  }
	});
  });
  
  
	 
  
	// Add a movie to a user's list of favorites
  app.post('/users/:Username/movies/:MovieID', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
	   $push: { FavoriteMovies: req.params.MovieID }
	 },
	 { new: true }, // This line makes sure that the updated document is returned
	(err, updatedUser) => {
	  if (err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  } else {
		res.json(updatedUser);
	  }
	});
  });  
  
	
  
  // DELETE a movie to a user's list of favorites
  app.delete('/users/:Username/movies/:MovieID', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
	   $pull: { FavoriteMovies: req.params.MovieID }
	 },
	 { new: true }, // This line makes sure that the updated document is returned
	(err, updatedUser) => {
	  if (err) {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  } else {
		res.json(updatedUser);
	  }
	});
  });
  
	  
  
  // Delete a user by username
  app.delete('/users/:Username', (req, res) => {
	Users.findOneAndRemove({ Username: req.params.Username })
	  .then((user) => {
		if (!user) {
		  res.status(400).send(req.params.Username + ' was not found');
		} else {
		  res.status(200).send(req.params.Username + ' was deleted.');
		}
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
  
  
	
  
  // Get all movies
  app.get('/movies', (req, res) => {
	Movies.find()
	  .then((movies) => {
		res.status(200).json(movies);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });  
  
	
  
  // Get a movie by title
  app.get('/movies/:Title', (req, res) => {
	Movies.findOne({ Title: req.params.Title })
	  .then((movie) => {
		res.json(movie);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
  
	  
  
  // Get a Movie by Genre
  app.get('/movies/genre/:genreName', (req, res) => {
	Movies.findOne({ 'Genre.Name': req.params.genreName })
	  .then((movie) => {
		res.json(movie.Genre);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
		
  // Get a Movie by Director
  app.get('/movies/directors/:directorName', (req, res) => {
	Movies.findOne({ 'Director.Name': req.params.directorName })
	  .then((movie) => {
		res.json(movie.Director);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  }); 

//Documentation
app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", { root: __dirname });
  });

  // error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Uh Oh, something isn't where it is supposed to be, i'll go looking, please try later");
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});
