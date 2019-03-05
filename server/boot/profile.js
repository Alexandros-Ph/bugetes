module.exports = function(app)
{
  var User = app.models.MyUser;
  var RoleMapping = app.models.RoleMapping;

  app.get('/profile',function(req, res) {
    res.render('profile', {
      accessToken: req.accessToken.id
    });
  });

  app.post('/delete', function(request, response){
    if (Array.isArray(request.body.target_id)) var targ_id = request.body.target_id[request.body.index];
    else var targ_id = request.body.target_id;
    User.destroyById(targ_id, function(err){
      if(err) {
        response.render('response', { //render view named 'response.ejs'
          title: 'Could not delete account!',
          content: err.message,
          redirectTo: '/stats_adm?access_token='+request.body.token,
          redirectToLinkText: 'Back'
        });
        return;
      }

      RoleMapping.findOne(
        {where: {principalId: targ_id}
      }, function(error, map){
        console.log(map);
          if(error) {
            response.render('response', { //render view named 'response.ejs'
              title: 'Could not delete account!',
              content: err.message,
              redirectTo: '/stats_adm?access_token='+request.body.token,
              redirectToLinkText: 'Back'
            });
            return;
          }
          else if (map){
          RoleMapping.destroyById(map.id, function(wrong){
            if(wrong) {
              response.render('response', { //render view named 'response.ejs'
                title: 'Could not delete account!',
                content: wrong.message,
                redirectTo: '/stats_adm?access_token='+request.body.token,
                redirectToLinkText: 'Back'
              });
              return;
            }
          });
        }
          response.redirect('/stats_adm?access_token='+request.body.token);
        });
    });
  });

}
