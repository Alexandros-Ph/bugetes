module.exports = function(app) {
	var Product = app.models.Product;

	app.post('/search', function(req,res){
		Product.find(function(err, productInstances) {
			if(err) {
				res.render('response', { //render view named 'response.ejs'
					title: 'Search failed',
					content: err.message,
					redirectTo: '/home',
					redirectToLinkText: 'Back'
				});
				return;
			}
			res.render('search', {
				foods: productInstances,
				accessToken: req.body.token
			})
		});
	});
}
