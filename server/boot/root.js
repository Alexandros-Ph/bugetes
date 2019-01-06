'use strict';

module.exports = function(app) {

  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  // use res.render to load up an ejs view file
  // index page
  app.get('/', function(req, res) {
      res.render('index');
  });

  app.get('/register', (req, res) => {
    res.render('register');
   });

   // create provider role if it doesn't exist Already
   Role.findOne({where: {name: 'provider'}}, function(err, req){
     if (err) throw err;
     if (req == null){

       Role.create({
         name: 'provider'
       }, function(err, role) {
         if (err) throw err;
       });

     }
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
       // if he selected provider, make him a provider
       if (req.body.select == 2){
         Role.findOne({where: {name: 'provider'}}, function(err, role) {
           role.principals.create({
             principalType: RoleMapping.USER,
             principalId: userInstance.id
           }, function(err, principal) {
             if (err) throw err;
           });
         });
       }
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


// create dev role if it doesn't exist already

  Role.findOne({where: {name: 'dev'}}, function(err, req){
    if (err) throw err;
    if (req == null){

      User.find({where: {or: [{email: 'alex.pachos1@gmail.com'}, {email: 'miltos503@gmail.com'}, {email: 'aliki.mat@gmail.com'}, {email: 'fotinidelig@gmail.com'}, {email: 'stzesiades@gmail.com'}, {email: 'lykmast@gmail.com'}]}},
        function(err, team){

          if (err) {
            throw err;
            return;
          }

          Role.create({
            name: 'dev'
          }, function(err, role) {
            if (err) throw err;

            //make all team devs
            team.forEach(function(member){
              role.principals.create({
                principalType: RoleMapping.USER,
                principalId: member.id
              }, function(err, principal) {
                if (err) throw err;
              });
            });

          });
      });

    }

  });


};
