module.exports = function(app){
  var Reports = app.models.Report;
  var RoleMapping = app.models.RoleMapping;
  var User = app.models.MyUser;
  var Price = app.models.Price;
  var async = require("async");

  app.get('/stats_adm', function(req1, res1){

    Price.count(function(errc, count){
      if(errc) {
        res1.render('response', { //render view named 'response.ejs'
          title: 'Cannot count posts',
          content: errc.message,
          redirectTo: '/admin_home?access_token='+req1.accessToken.id,
          redirectToLinkText: 'Back'
        });
        return;
      }
      res1.render('stats_adm', {
        accessToken: req1.accessToken.id,
        posts: count
      });
    });

  });

  app.get('/prov_acc', function(req2, res2){
    RoleMapping.find({
      include: {
        relation: 'role',
        scope: {
          where: {name: 'provider'}
        }
      }
    }, function(err, rolemaps) {
      if(err) {
        res2.render('response', { //render view named 'response.ejs'
          title: 'Something went wrong',
          content: err.message,
          redirectTo: '/admin_home?access_token='+req2.accessToken.id,
          redirectToLinkText: 'Back'
        });
        return;
      }
      var prov_array = [];
      async.eachSeries(rolemaps, function(map, callback) {
        var temp = map.toJSON();
        if (temp.role){
          User.findOne({
            where: {id: temp.principalId}
          }, function(wrong, provider){
            if(wrong) {
              res2.render('response', { //render view named 'response.ejs'
                title: 'Something went wrong',
                content: err.message,
                redirectTo: '/admin_home?access_token='+req2.accessToken.id,
                redirectToLinkText: 'Back'
              });
              return;
            }
            prov_array.push(provider);
            callback();
          });
        }
        else{
          callback();
        }
      }, function(){
        res2.render('providers_acc', {
          accessToken: req2.accessToken.id,
          provs: prov_array
        });
      });

    });

  });

  app.get('/usr_acc', function(req3, res3){
    RoleMapping.find({
      fields: {principalId: true}
    }, function(err3, ids){
      if(err3) {
        res3.render('response', { //render view named 'response.ejs'
          title: 'Something went wrong',
          content: error3.message,
          redirectTo: '/admin_home?access_token='+req3.accessToken.id,
          redirectToLinkText: 'Back'
        });
        return;
      }
      var id_array = [];
      ids.forEach(function(id){
        id_array.push(id.principalId);
      });
      User.find({
        where: {id: {nin: id_array}}
      }, function(error3, users){
        if(error3) {
          res3.render('response', { //render view named 'response.ejs'
            title: 'Something went wrong',
            content: error3.message,
            redirectTo: '/admin_home?access_token='+req3.accessToken.id,
            redirectToLinkText: 'Back'
          });
          return;
        }
        res3.render('users_acc', {
          accessToken: req3.accessToken.id,
          user_array: users
        });
      });
    });

  });
  app.get('/reports', function(req4, res4){
    res4.render('reports', {
      accessToken: req4.accessToken.id
    });
  });

  app.post('/reports', function(req,res){
		Reports.find({include: ['user']}, function(err, reports) {
			if(err) {
				res.render('response', { //render view named 'response.ejs'
					title: 'No reports registered',
					content: err.message,
					redirectTo: '/stats_adm',
					redirectToLinkText: 'Back'
				});
				return;
			}
			var rep_array = [];
			reports.forEach(function(reprt) {
   			var temp = reprt.toJSON();
   			rep_array.push(temp);
 		});
			res.render('reports', {
				front_reprt: reprt
			})
		});
	});
}
