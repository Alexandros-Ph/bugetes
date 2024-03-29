'use strict';

var app = require('./server');
var User = app.models.MyUser;
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;

// create provider role
Role.findOrCreate({
  name: 'provider'
}, function(err) {
  if (err) throw err;
});

// create dev role
Role.findOrCreate({
  name: 'admin'
}, function(err) {
  if (err) throw err;
});


User.find({where: {or: [{email: 'alex.pachos1@gmail.com'}, {email: 'miltos503@gmail.com'}, {email: 'aliki.mat@gmail.com'}, {email: 'fotinidelig@gmail.com'}, {email: 'stzesiades@gmail.com'}, {email: 'lykmast@gmail.com'}]}},
  function(err, team){

    if (err) {
      throw err;
      return;
    }

    Role.findOrCreate({
      name: 'dev'
    }, function(err, role) {
      if (err) throw err;

      //make all team devs
      team.forEach(function(member){

        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: member.id
        }, function(err, principal) {
          if (err) {
            throw err;
          }
          app.dataSources.db.disconnect();
        });
      });
    });
});
