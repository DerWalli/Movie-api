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

/**
 * body-parser package for reading data from requests 
*/
app.use(bodyParser.json());

/** 
 * uses middlewear module morgan for logging 
 */
app.use(morgan('common'));
app.use(express.static('public'));


let auth = require('./auth')(app);
const passport = require('passport');
require ('./passport');

/**
 * Business logic is modeled with Mongoose
 */

 mongoose.connect('mongodb+srv://DerWalli:43zTAhN5jEtkD7P@martinsdb.nop4cxy.mongodb.net/myFlixDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log("MongoDB Connected"));






//Welcome
/**
 * Get a user by username
 * @name getUser
 * @kind function
 * @param {string} Username
 * @requires passport
 * @returns An object containing information about the user
 */
app.get('/', (req, res) => {
  res.send('Welcome to my Moviedatabase MyFlix');
});


//Create User
/** 
 * POST new user upon registration if a matching user is not found.
 * Perform checks on Username, Password and Email fields 
 * Hash the user's password
 * We’ll expect JSON in this format: {ID: Integer, Username: String, Password: String, Email: String, Birthday: Date}
 * @name registerUser
 * @kind function
 * @returns new user object
*/

app.post('/users',

  [
    check('Username', 'Username is required').isLength({min: 3}),
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

  /**
	 * Get a user by username
	 * @name getUser
	 * @kind function
	 * @param {string} Username
	 * @requires passport
	 * @returns An object containing information about the user
	 */
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

   
    /**
	 * UPDATE - Update a user's info, by username
	 * Expect JSON in this format: {Username: String (required), Password: String (required), Email: String (required), Birthday: Date}
	 * @name editUser
	 * @kind function
	 * @param {string} Username
	 * @requires passport
	 * @returns An object containing the user's updated information
	 */

  app.put(
	"/users/:Username",
	passport.authenticate("jwt", { session: false }),
	[
	  check("Username", "username is required").isLength({ min: 3 }),
	  check(
		"Username",
		"username can only be made of letters and numbers"
	  ).isAlphanumeric(),
	  check("Password", "password needs to be 8 characters long.").isLength({
		min: 3,
	  }),
	  check("Email", "valid email is required").isEmail(),
	],
	(req, res) => {
	  let errors = validationResult(req);
  
	  if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	  }
  
	  let hashedPassword = Users.hashPassword(req.body.Password);
	  Users.findOneAndUpdate(
		{ Username: req.params.Username },
		{
		  $set: {
			Username: req.body.Username,
			Email: req.body.Email,
			Password: hashedPassword,
			Birthday: req.body.Birthday,
		  },
		},
		{ new: true },
		(err, newUser) => {
		  if (err) {
			res.status(500).send("Error " + err);
		  }
		  if (!newUser) {
			res
			  .status(401)
			  .send(
				`${req.params.username} not found, make sure username entered correctly.`
			  );
		  } else {
			res.status(201).json({
			  message: "User Updated Sucessfully",
			  newUser: newUser,
			});
		  }
		}
	  );
	}
  );
    
	 
  
	
	/**
	 * UPDATE user's list of favorites by enabling them to add a movie to their list (array);
	 * @name addFavoriteMovie
	 * @kind function
	 * @param {string} Username user's Username
	 * @param {string} MovieID id of the movie
	 * @requires passport
	 * @returns the updated user object with the new favorite movie added to the FavoriteMovies array 
	 */
  app.post('/users/:Username/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
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
  
	
  
  /**
	 * DELETE a movie from user's list of favorites
	 * requires bearer token
	 * @name removeFavoriteMovie
	 * @kind function
	 * @param {string} Username user's Username
	 * @param {string} MovieID movie's ID
	 * @requires passport
	 * @returns the updated user object with the removed favorite movie from the FavoriteMovies array
	 */
  app.delete('/users/:Username/:MovieID', (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username }, {
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
  
	  
  


  /**
 * DELETE a user by his _id
 * requires bearer token
 * @name removeFavoriteMovie
 * @kind function
 * @param {string} _id user's ID
 * @requires passport
 * @returns A text message indicating whether the user was successfully deregistered
 */
  app.delete('/users/:_id', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({ _id: req.params._id })
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
  
  
	
  
  /**
	 * GET a list of all movies
	 * request: bearer token
	 * @name getAllMovies
	 * @kind function
	 * @requires passport
	 * @returns An array of objects containing movie information
	 */
  app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find()
	  .then((movies) => {
		res.status(200).json(movies);
	  })
	  .catch((err) => {
		console.error(err);
		res.status(500).send('Error: ' + err);
	  });
  });  
  
	
  
  /**
	 * Get data about a single movie by title;
	 * @name getMovie
	 * @kind function
	 * @param {string} Title
	 * @requires passport
	 * @returns An objects containing information about a single movie
	 */
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
  
	  
  
  /**
	 * Get data about a genre
	 * @name getGenre
	 * @kind function
	 * @param {string} genreName of the required genre
	 * @requires passport
	 * @returns An object containing information about a genre
	 */
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
		
  /**
	 * Get data about a director (bio, birth year, etc) by name;
	 * @name getDirector
	 * @kind function
	 * @param {string} directorName of the required director
	 * @requires passport
	 * @returns An object containing information about a director 
	 */
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

  /** 
 * ERROR handling middleware function
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Uh Oh, something isn't where it is supposed to be, i'll go looking, please try later");
});


/** 
 * LISTENER 
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
	console.log('Listening on Port ' + port);
});