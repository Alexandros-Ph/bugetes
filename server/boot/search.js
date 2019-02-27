module.exports = function(app) {
	var Price = app.models.Price;

	app.post('/search', function(req,res){
		Price.find({include: ['product']}, function(err, foodInstances) {
			if(err) {
				res.render('response', { //render view named 'response.ejs'
					title: 'Search failed',
					content: err.message,
					redirectTo: '/home',
					redirectToLinkText: 'Back'
				});
				return;
			}
			var food_array = [];
			foodInstances.forEach(function(food) {
   			var temp = food.toJSON();
   			food_array.push(temp);
 		});
			res.render('search', {
				foods: food_array,
				accessToken: req.body.token
			})
		});
	});
}
