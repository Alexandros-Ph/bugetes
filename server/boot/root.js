'use strict';



module.exports = function(app) {

  var User = app.models.User;

  // use res.render to load up an ejs view file
  // index page
  app.get('/', function(req, res) {
      res.render('index');
  });


  // Install a `/` route that returns server status
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
