module.exports = function(app){
  var Reports = app.models.Report;

  app.get('/stats_adm', function(req, res){
    res.render('stats_adm');
  });
  app.get('/prov_acc', function(req, res){
    res.render('providers_acc');
  });
  app.get('/usr_acc', function(req, res){
    res.render('users_acc');
  });
  app.get('/reports', function(req, res){
    res.render('reports');
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
