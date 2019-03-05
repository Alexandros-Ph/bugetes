module.exports = function(app) {

	var geo = require('../geo');
	var Price = app.models.Price;
	var Product = app.models.Product;
	var Shop = app.models.Shop;


	function all(req, res, port, start, dist){						// functions that renders all products in search
		Price.find({where: {
			amount: {gte: port} },
			include: ['product']}, async function(err, foodInstances) {
			if(err) {
				res.render('response', {	 				//render view named 'response.ejs'
					title: 'Search failed',
					content: err.message,
					redirectTo: '/home',
					redirectToLinkText: 'Back'
				});
				return;
			}
			var final_shops = [];
			var final_foods = [];
			var food_array = [];
			foodInstances.forEach(function(food) {
   			var temp = food.toJSON();
   			food_array.push(temp);
 		});
		var near = await geo(start);
		Shop.find({
  		where: {
    		location: {
      	near: near,
      	maxDistance: dist,
      	unit: 'kilometers'
    		}
  		}
		}, function(error10, shops){
			if(error10) {
				res.render('response', {	 				//render view named 'response.ejs'
					title: 'Search failed',
					content: error10.message,
					redirectTo: '/home',
					redirectToLinkText: 'Back'
				});
				return;
			}

			food_array.forEach(function(f){
				shops.forEach(function(s){
					if (f.userId == s.userId){
						final_foods.push(f);
						final_shops.push([s.location.lat,s.location.lng]);
					}
				});
			});
			res.render('search', {
				foods: final_foods,
				accessToken: req.body.token,
				start: start,
				dist: dist,
				lat: near.lat,
				lng: near.lng,
				shops: final_shops
			});
		});

		});
	}

	app.post(['/search', '/reset'], function(req,res){
		all(req, res, 1, req.body.start, req.body.dist);
	});

	app.post('/filters', function(req, res){
		if (!req.body.category){		// no filters selected
			all(req, res, req.body.portions, req.body.start, req.body.dist);
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
			}, async function(err, foodInstances) {
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
			var final_shops = [];
			var final_foods = [];
			var food_array = [];
			foodInstances.forEach(function(food) {
				var temp = food.toJSON();
				if (temp.product)
					food_array.push(temp);
		});

		var near = await geo(req.body.start);
		Shop.find({
			where: {
				location: {
				near: near,
				maxDistance: req.body.dist,
				unit: 'kilometers'
				}
			}
		}, function(error10, shops){
			if(error10) {
				res.render('response', {	 				//render view named 'response.ejs'
					title: 'Search failed',
					content: error10.message,
					redirectTo: '/home',
					redirectToLinkText: 'Back'
				});
				return;
			}

			food_array.forEach(function(f){
				shops.forEach(function(s){
					if (f.userId == s.userId)
						final_foods.push(f);
						final_shops.push([s.location.lat,s.location.lng]);
				});
			});
			res.render('search', {
				foods: final_foods,
				accessToken: req.body.token,
				start: req.body.start,
				dist: req.body.dist,
				lat: near.lat,
				lng: near.lng,
				shops: final_shops
			});
		});


		});
	});
}
