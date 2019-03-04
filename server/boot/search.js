module.exports = function(app) {
	var Price = app.models.Price;
	var Product = app.models.Product;

	function all(req, res, port){						// functions that renders all products in search
		Price.find({where: {
			amount: {gte: port} },
			include: ['product']}, function(err, foodInstances) {
			if(err) {
				res.render('response', {	 				//render view named 'response.ejs'
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
	}

	app.post(['/search', '/reset'], function(req,res){
		all(req, res, 1);
	});

	app.post('/filters', function(req, res){
		if (!req.body.category){		// no filters selected
			all(req, res, req.body.portions);
			return;
		}
		Price.find({
				where: {
					amount: {gte: req.body.portions}
				},
				include: {
					relation: 'product',
					scope: {
						where: {category: {inq: req.body.category}}
					}
				}
			}, function(err, foodInstances) {
				//console.log(foodInstances);
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
				if (temp.product)
					food_array.push(temp);
		});
			res.render('search', {
				foods: food_array,
				accessToken: req.body.token
			})
		});
	});
}
