const mongoose = require('mongoose');
const Models = require('./models.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const {check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const cors = require('cors');
app.use(cors());



const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.json());

app.use(morgan('common'));
app.use(express.static('public'));


let auth = require('./auth')(app);
const passport = require('passport');
require ('./passport');


//mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB?directConnection=true', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log("MongoDB Connected"));
 





//Welcome
app.get('/', (req, res) => {
  res.send('Welcome to my Moviedatabase MyFlix');
});


//Create User
/* We'll expect JSON in this format
{
	ID: Integer,
	Name: String,
	Password: String,
	Email: String,
	Birthday: Date
}*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
	  {
		Username: req.body.Username,
		Password: hashedPassword,
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
  app.post('/users/:Username/:MovieId', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
	   $push: { Favorites: req.params.MovieId }
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
  app.delete('/users/:Username/:MovieID', (req, res) => {
	Users.findOneAndUpdate({ Userame: req.params.Userame }, {
	   $pull: { Favorites: req.params.MovieID }
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
  /*app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  });*/


  // Delete a user by _id
  app.delete('/users/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({ _Id: req.params._id })
	  .then((user) => {
		if (!user) {
		  res.status(400).send(req.params._id + ' was not found');
		} else {
		  res.status(200).send(req.params._id + ' was deleted.');
		}
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });
  
  
	
  
  // Get all movies
  //app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
/* app.listen(8080, () => {
    console.log('Your app is listening on Port 8080.');
});*/

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
	console.log('Listening on Port ' + port);
});
