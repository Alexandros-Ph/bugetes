'use strict';



module.exports = function(app) {

  var User = app.models.User;

  // use res.render to load up an ejs view file
  // index page
  app.get('/', function(req, res) {
      res.render('index');
  });

  app.get('/register', (req, res) => {
    res.render('register');
   });

// register a user
   app.post('/register', function(req, res){
     User.create({
       username: req.body.fname,
       email: req.body.email,
       password: req.body.pass
     }, function(err, userInstance) {
       if (err) {
         res.render('response', { //render view named 'response.ejs'
           title: 'Registration failed',
           content: err.message,
           redirectTo: '/register',
           redirectToLinkText: 'Try again'
         });
         return;
       }
       console.log(userInstance);
       res.render('index');
     });
   });

// login a user
  app.post('/login', function(req, res) {
    User.login({
      email: req.body.email,
      password: req.body.pass
    }, 'user', function(err, token) {
      if (err) {
        res.render('response', { //render view named 'response.ejs'
          title: 'Login failed',
          content: err,
          redirectTo: '/',
          redirectToLinkText: 'Try again'
        });
        return;
      }

      res.render('home', { //login user and render 'home' view
        email: req.body.email,
        accessToken: token.id
      });
    });
  });
};
