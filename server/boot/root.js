'use strict';

module.exports = function(app) {

  var User = app.models.MyUser;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  var Shop = app.models.Shop;
  // use res.render to load up an ejs view file
  // index page
  app.get('/', function(req, res) {
      res.render('index');
  });

  app.get('/register', function(req, res) {
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
       // if he selected provider, make him a provider
       if (req.body.select == 2){
         Role.findOne({where: {name: 'provider'}}, function(err, role) {
           role.principals.create({
             principalType: RoleMapping.USER,
             principalId: userInstance.id
           }, function(err, principal) {
             if (err) throw err;
           });
           Shop.create({
			 name: userInstance.username,
             address: req.body.addr,
             userId: userInstance.id
           }, function(error){
             if (error) throw error;
           });
         });
       }
       res.render('index');
     });
   });

// log in a user
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
      User.findOne({where: {email: req.body.email}}, function(err, user) {    //find user's id
        if (err) throw err;
        RoleMapping.findOne({where: {principalId: user.id}}, function(fal, map){
          if (fal) throw fal;
          Role.findOne({where: {id: map.roleId}}, function(no, obj) {
            if (no) throw no;
              if (obj.name == 'provider'){
                res.render('prov_home', {             //login provider and render 'prov_home' view
                  email: req.body.email,
                  accessToken: token.id
                });
              }
              else{
                res.render('home', {                   //login user and render 'home' view
                  email: req.body.email,
                  accessToken: token.id
                });
              }
            });
          });
        });
    });
  });

  app.get('/prov_home', function(req, res, next) {            // ONLY WORKS FOR PROVIDER, MUST IMPLEMENT USER
    if (!req.accessToken) return res.sendStatus(401);         //return 401:unauthorized if accessToken is not present
    res.render('prov_home', {                                 // render 'prov_home' view
      accessToken: req.accessToken.id
    });
  });


// log out a user
  app.get('/logout', function(req, res, next) {
    if (!req.accessToken) return res.sendStatus(401);         //return 401:unauthorized if accessToken is not present
    User.logout(req.accessToken.id, function(err) {
      if (err) return next(err);
      res.redirect('/'); //on successful logout, redirect
    });
  });

};
